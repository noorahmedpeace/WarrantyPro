const { Resend } = require('resend');

class EmailService {
    constructor() {
        const apiKey = process.env.RESEND_API_KEY;
        if (apiKey) {
            this.resend = new Resend(apiKey);
        } else {
            console.warn('⚠️ RESEND_API_KEY is missing. Email service will not work.');
        }
        this.fromEmail = process.env.NOTIFICATION_FROM_EMAIL || 'onboarding@resend.dev';
    }

    /**
     * Send warranty claim email to manufacturer
     * @param {Object} claimEmailData
     * @returns {Promise<Object>} Email send result
     */
    async sendClaimEmail(claimEmailData) {
        if (!this.resend) {
            console.warn('Cannot send email: RESEND_API_KEY is missing');
            return { success: false, error: 'Email service not configured' };
        }
        try {
            const {
                to,
                cc,
                subject,
                body,
                attachments = [],
                warranty,
                user
            } = claimEmailData;

            // Build HTML email
            const htmlBody = this.buildClaimEmailHtml(body, warranty, user);

            const emailData = {
                from: this.fromEmail,
                to: to,
                subject: subject,
                html: htmlBody,
            };

            // Add CC if provided (user's email)
            if (cc) {
                emailData.cc = cc;
            }

            // Add reply-to as user's email
            if (user?.email) {
                emailData.reply_to = user.email;
            }

            // Note: Resend doesn't support attachments in the same way
            // For production, you'd need to upload files to a CDN and include links
            if (attachments.length > 0) {
                htmlBody += '\n\n<p><strong>Attached Documents:</strong></p><ul>';
                attachments.forEach(att => {
                    htmlBody += `<li>${att.filename}</li>`;
                });
                htmlBody += '</ul>';
            }

            const result = await this.resend.emails.send(emailData);

            return {
                success: true,
                messageId: result.id,
                sentAt: new Date()
            };
        } catch (error) {
            console.error('Failed to send claim email:', error);
            throw new Error(`Email send failed: ${error.message}`);
        }
    }

    /**
     * Build HTML email for claim submission
     */
    buildClaimEmailHtml(bodyText, warranty, user) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
        }
        .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e0e0e0;
            border-top: none;
        }
        .product-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .product-info table {
            width: 100%;
            border-collapse: collapse;
        }
        .product-info td {
            padding: 8px;
            border-bottom: 1px solid #e0e0e0;
        }
        .product-info td:first-child {
            font-weight: 600;
            width: 40%;
        }
        .body-text {
            white-space: pre-wrap;
            margin: 20px 0;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 0 0 10px 10px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .signature {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0; font-size: 24px;">Warranty Claim Request</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Submitted via WarrantyPro</p>
    </div>
    
    <div class="content">
        <div class="product-info">
            <h3 style="margin-top: 0;">Product Information</h3>
            <table>
                <tr>
                    <td>Product Name</td>
                    <td>${warranty.product_name}</td>
                </tr>
                <tr>
                    <td>Brand</td>
                    <td>${warranty.brand}</td>
                </tr>
                ${warranty.serial_number ? `
                <tr>
                    <td>Serial Number</td>
                    <td>${warranty.serial_number}</td>
                </tr>
                ` : ''}
                <tr>
                    <td>Purchase Date</td>
                    <td>${new Date(warranty.purchase_date).toLocaleDateString()}</td>
                </tr>
                <tr>
                    <td>Warranty Duration</td>
                    <td>${warranty.warranty_duration_months} months</td>
                </tr>
                ${warranty.retailer ? `
                <tr>
                    <td>Purchased From</td>
                    <td>${warranty.retailer}</td>
                </tr>
                ` : ''}
            </table>
        </div>

        <div class="body-text">
${bodyText}
        </div>

        <div class="signature">
            <p><strong>Best regards,</strong></p>
            <p>
                ${user.name || 'Customer'}<br>
                ${user.email}<br>
                ${user.phone ? user.phone + '<br>' : ''}
            </p>
            <p style="font-size: 11px; color: #999; margin-top: 20px;">
                This claim was submitted through WarrantyPro - Smart Warranty Management
            </p>
        </div>
    </div>
    
    <div class="footer">
        <p>This is an automated warranty claim submission.</p>
        <p>For questions, please contact ${user.email}</p>
    </div>
</body>
</html>
        `;
    }

    /**
     * Send claim confirmation to user
     */
    async sendClaimConfirmation(user, claim, warranty) {
        if (!this.resend) return { success: false, error: 'Email service not configured' };
        try {
            const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
        .content { background: white; padding: 30px; margin-top: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status-badge { display: inline-block; padding: 8px 16px; background: #10b981; color: white; border-radius: 20px; font-weight: bold; }
        .info-box { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Claim Submitted Successfully! ✓</h1>
        </div>
        <div class="content">
            <p>Hi ${user.name},</p>
            <p>Your warranty claim has been submitted successfully. Here are the details:</p>
            
            <div class="info-box">
                <p><strong>Claim Number:</strong> ${claim.claimNumber}</p>
                <p><strong>Product:</strong> ${warranty.product_name}</p>
                <p><strong>Status:</strong> <span class="status-badge">${claim.status.toUpperCase()}</span></p>
                <p><strong>Submitted:</strong> ${new Date(claim.claimDate).toLocaleString()}</p>
            </div>

            <h3>What's Next?</h3>
            <ol>
                <li>The manufacturer will review your claim</li>
                <li>You'll receive updates via email</li>
                <li>Track your claim status in the WarrantyPro app</li>
            </ol>

            <p>We've sent your claim email to the manufacturer. You should receive a response within 3-5 business days.</p>

            <p style="margin-top: 30px;">
                <strong>Need help?</strong><br>
                Visit your WarrantyPro dashboard or reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
            `;

            await this.resend.emails.send({
                from: this.fromEmail,
                to: user.email,
                subject: `Claim Submitted: ${claim.claimNumber} - ${warranty.product_name}`,
                html: html
            });

            return { success: true };
        } catch (error) {
            console.error('Failed to send confirmation email:', error);
            // Don't throw - confirmation email is not critical
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();
