const express = require('express');
const notificationService = require('../services/notificationService');

const router = express.Router();

/**
 * GET /api/notifications
 * Get user's notification history
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.userId; // From auth middleware
        const limit = parseInt(req.query.limit) || 50;

        const notifications = await notificationService.getUserNotifications(userId, limit);
        const unreadCount = await notificationService.getUnreadCount(userId);

        res.json({
            notifications,
            unreadCount
        });

    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 */
router.get('/unread-count', async (req, res) => {
    try {
        const userId = req.userId;
        const count = await notificationService.getUnreadCount(userId);

        res.json({ count });

    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: 'Failed to get unread count' });
    }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
router.patch('/:id/read', async (req, res) => {
    try {
        const userId = req.userId;
        const notificationId = req.params.id;

        const notification = await notificationService.markAsRead(notificationId, userId);

        res.json({ notification });

    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(404).json({ error: error.message });
    }
});

/**
 * POST /api/notifications/test
 * Send a test notification (for development/testing)
 */
router.post('/test', async (req, res) => {
    try {
        const result = await notificationService.checkAndSendExpiryNotifications();
        res.json(result);

    } catch (error) {
        console.error('Test notification error:', error);
        res.status(500).json({ error: 'Failed to send test notification' });
    }
});

module.exports = router;
