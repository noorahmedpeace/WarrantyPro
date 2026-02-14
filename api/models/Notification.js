const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    warrantyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warranty',
        required: true
    },
    type: {
        type: String,
        enum: ['30d', '7d', '0d', 'expired'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    productName: String,
    expiryDate: Date,
    daysUntilExpiry: Number,
    sentAt: {
        type: Date,
        default: Date.now
    },
    readAt: Date,
    emailSent: {
        type: Boolean,
        default: false
    },
    emailSentAt: Date,
    pushSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound index for efficient querying
notificationSchema.index({ userId: 1, warrantyId: 1, type: 1 });
notificationSchema.index({ userId: 1, readAt: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
