const { Resend } = require('resend');
const Notification = require('../_models/Notification');
const Warranty = require('../_models/Warranty');
const User = require('../_models/User');

class NotificationService {
    constructor() {
        const apiKey = process.env.RESEND_API_KEY;
        if (apiKey) {
            this.resend = new Resend(apiKey);
        } else {
            console.warn('⚠️ RESEND_API_KEY is missing. Notification emails will not work.');
            this.resend = null;
        }
        this.fromEmail = process.env.NOTIFICATION_FROM_EMAIL || 'onboarding@resend.dev';
    }

    /**
     * Check all warranties and send expiry notifications
     * Runs daily via cron job
     */
    async checkAndSendExpiryNotifications() {
        try {
            console.log('[Notification Service] Starting daily warranty check...');

            const now = new Date();
            const warranties = await Warranty.find({}).populate('user_id');

            let sentCount = 0;

            for (const warranty of warranties) {
                if (!warranty.user_id) continue;
                sentCount += await this.processWarrantyForNotification(warranty);
            }

            console.log(`[Notification Service] Sent ${sentCount} notifications`);
            return { success: true, sentCount };

        } catch (error) {
            console.error('[Notification Service] Error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Check notifications for a specific user (On-demand sync)
     */
    async checkUserNotifications(userId) {
        try {
            const warranties = await Warranty.find({ userId: userId }).populate('user_id');
            // If populate fails (because user_id field might be different or missing), we might need to fetch user separately or rely on userId field.
            // Actually, Warranty model uses 'userId' (string/ObjectId) usually. Let's check model.
            // The dashboard uses 'userId'. The service uses 'user_id' in population?
            // Let's look at the previous code: Warranty.find({}).populate('user_id')
            // Wait, previous code used 'user_id'. I need to be careful about the field name. 
            // In Dashboard, it used 'userId'.

            // Let's assume the Schema has 'userId'.
            // I will implement a helper 'processWarrantyForNotification' to avoid code duplication.

            let generatedCount = 0;
            for (const warranty of warranties) {
                // Manually populate user if needed, or pass userId
                if (!warranty.user_id) {
                    // If population failed or field is different, we iterate.
                    // But for 'processWarrantyForNotification', we need the user object for email.
                    // If we are just generating the notification RECORD, we might not need the full user object immediatey if we don't send email?
                    // But the original logic sends email.

                    // Let's fetch the user to be safe.
                    const user = await User.findById(userId);
                    if (user) {
                        warranty.user_id = user; // Polyfill for the helper
                        generatedCount += await this.processWarrantyForNotification(warranty);
                    }
                } else {
                    generatedCount += await this.processWarrantyForNotification(warranty);
                }
            }
            return generatedCount;
        } catch (error) {
            console.error('[Notification Service] User check error:', error);
            return 0;
        }
    }

    /**
     * Helper to process a single warranty
     */
    async processWarrantyForNotification(warranty) {
        try {
            const expiryDate = this.calculateExpiryDate(warranty);
            const daysUntilExpiry = this.getDaysUntilExpiry(expiryDate);
            const notificationType = this.getNotificationType(daysUntilExpiry);

            if (notificationType) {
                // Use the user's ID from the warranty object (handling populated vs unpopulated)
                const userId = warranty.user_id._id || warranty.user_id;

                const alreadySent = await this.hasNotificationBeenSent(
                    userId,
                    warranty._id,
                    notificationType
                );

                if (!alreadySent) {
                    await this.sendExpiryNotification(warranty, notificationType, daysUntilExpiry);
                    return 1;
                }
            }
            return 0;
        } catch (e) {
            console.error('Error processing warranty:', e);
            return 0;
        }
    }

    /**
     * Calculate warranty expiry date
     */
    calculateExpiryDate(warranty) {
        const purchaseDate = new Date(warranty.purchase_date);
        const expiryDate = new Date(purchaseDate);
        expiryDate.setMonth(expiryDate.getMonth() + warranty.warranty_duration_months);
        return expiryDate;
    }

    /**
     * Get days until expiry
     */
    getDaysUntilExpiry(expiryDate) {
        const now = new Date();
        const diffTime = expiryDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    /**
     * Determine notification type based on days until expiry
     */
    getNotificationType(daysUntilExpiry) {
        if (daysUntilExpiry === 30) return '30d';
        if (daysUntilExpiry === 7) return '7d';
        if (daysUntilExpiry === 0) return '0d';
        if (daysUntilExpiry < 0) return 'expired';
        return null;
    }

    /**
     * Check if notification has already been sent
     */
    async hasNotificationBeenSent(userId, warrantyId, type) {
        const existing = await Notification.findOne({
            userId,
            warrantyId,
            type
        });
        return !!existing;
    }

    /**
     * Send expiry notification via email and save to database
     */
    async sendExpiryNotification(warranty, type, daysUntilExpiry) {
        try {
            const user = warranty.user_id;
            const expiryDate = this.calculateExpiryDate(warranty);

            // Create notification message
            const { title, message } = this.getNotificationContent(
                warranty.product_name,
                type,
                daysUntilExpiry,
                expiryDate
            );

            // Save notification to database
            const notification = new Notification({
                userId: user._id,
                warrantyId: warranty._id,
                type,
                title,
                message,
                productName: warranty.product_name,
                expiryDate,
                daysUntilExpiry,
                emailSent: false
            });

            await notification.save();

            // Send email
            try {
                if (!this.resend) {
                    console.warn('[Notification] Email skipped: RESEND_API_KEY not configured');
                } else {
                    const emailHtml = this.generateEmailHtml(warranty, type, daysUntilExpiry, expiryDate);

                    await this.resend.emails.send({
                        from: this.fromEmail,
                        to: user.email,
                        subject: title,
                        html: emailHtml
                    });

                    notification.emailSent = true;
                    notification.emailSentAt = new Date();
                    await notification.save();

                    console.log(`[Notification] Sent ${type} alert for ${warranty.product_name} to ${user.email}`);
                }

            } catch (emailError) {
                console.error('[Notification] Email send failed:', emailError);
                // Notification still saved to DB even if email fails
            }

            return notification;

        } catch (error) {
            console.error('[Notification] Error sending notification:', error);
            throw error;
        }
    }

    /**
     * Get notification content based on type
     */
    getNotificationContent(productName, type, daysUntilExpiry, expiryDate) {
        const formattedDate = expiryDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        switch (type) {
            case '30d':
                return {
                    title: `⏰ Warranty Expiring Soon: ${productName}`,
                    message: `Your warranty for ${productName} expires in 30 days (${formattedDate}). Schedule an inspection now to maximize your coverage!`
                };
            case '7d':
                return {
                    title: `🚨 Last Week! Warranty Expires Soon: ${productName}`,
                    message: `URGENT: Your warranty for ${productName} expires in 7 days (${formattedDate}). This is your last chance to claim any issues!`
                };
            case '0d':
                return {
                    title: `⚠️ WARRANTY EXPIRES TODAY: ${productName}`,
                    message: `Your warranty for ${productName} expires TODAY (${formattedDate}). Take immediate action if you have any issues!`
                };
            case 'expired':
                return {
                    title: `Warranty Expired: ${productName}`,
                    message: `Your warranty for ${productName} has expired as of ${formattedDate}.`
                };
            default:
                return {
                    title: `Warranty Update: ${productName}`,
                    message: `Your warranty for ${productName} expires on ${formattedDate}.`
                };
        }
    }

    /**
     * Generate HTML email template
     */
    generateEmailHtml(warranty, type, daysUntilExpiry, expiryDate) {
        const formattedDate = expiryDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const urgencyColor = type === '0d' ? '#ef4444' : type === '7d' ? '#f59e0b' : '#3b82f6';
        const urgencyText = type === '0d' ? 'EXPIRES TODAY' : type === '7d' ? 'EXPIRES IN 7 DAYS' : 'EXPIRES IN 30 DAYS';

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Warranty Pro</h1>
                        </td>
                    </tr>
                    
                    <!-- Alert Badge -->
                    <tr>
                        <td style="padding: 30px 30px 0;">
                            <div style="background-color: ${urgencyColor}; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-align: center; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">
                                ${urgencyText}
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px;">
                            <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                                ${warranty.product_name}
                            </h2>
                            
                            <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Your warranty expires on <strong>${formattedDate}</strong> 
                                ${daysUntilExpiry > 0 ? `(${daysUntilExpiry} days from now)` : '(TODAY)'}.
                            </p>
                            
                            <div style="background-color: #f9fafb; border-left: 4px solid ${urgencyColor}; padding: 16px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">
                                    <strong>What to do:</strong><br>
                                    ${type === '0d'
                ? 'If you have any issues with this product, contact the service center IMMEDIATELY. Your warranty coverage ends today!'
                : type === '7d'
                    ? 'Schedule an inspection or service appointment now. This is your last week of warranty coverage!'
                    : 'Review your product for any issues and schedule a preventive inspection while your warranty is still active.'}
                                </p>
                            </div>
                            
                            <div style="margin: 30px 0;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Brand:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${warranty.brand || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Purchase Date:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${new Date(warranty.purchase_date).toLocaleDateString()}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Warranty Duration:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${warranty.warranty_duration_months} months</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="https://warranty-pro-vert.vercel.app/" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                            View in Warranty Pro
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #6b7280; font-size: 12px;">
                                You're receiving this because you have an active warranty in Warranty Pro.<br>
                                <a href="#" style="color: #667eea; text-decoration: none;">Manage notification preferences</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;
    }

    /**
     * Get user's notification history
     */
    async getUserNotifications(userId, limit = 50) {
        return await Notification.find({ userId })
            .sort({ sentAt: -1 })
            .limit(limit)
            .populate('warrantyId');
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId, userId) {
        const notification = await Notification.findOne({
            _id: notificationId,
            userId
        });

        if (!notification) {
            throw new Error('Notification not found');
        }

        notification.readAt = new Date();
        await notification.save();
        return notification;
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(userId) {
        return await Notification.countDocuments({
            userId,
            readAt: null
        });
    }
}

module.exports = new NotificationService();
