// Vercel Cron Job Handler
// This endpoint is triggered by Vercel Cron (configured in vercel.json)
// Or can be called manually for testing

const notificationService = require('../_services/notificationService');

module.exports = async (req, res) => {
    try {
        // Verify the request is from Vercel Cron or has the correct authorization
        const authHeader = req.headers.authorization;
        const cronSecret = process.env.CRON_SECRET || 'dev-secret';

        if (authHeader !== `Bearer ${cronSecret}`) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        console.log('[Cron] Running daily warranty expiry check...');

        const result = await notificationService.checkAndSendExpiryNotifications();

        console.log(`[Cron] Check complete. Sent ${result.sentCount} notifications`);

        res.status(200).json({
            success: true,
            message: `Sent ${result.sentCount} notifications`,
            ...result
        });

    } catch (error) {
        console.error('[Cron] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
