const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    alert_days_before: { type: Number, default: 30 },
    email_notifications: { type: Boolean, default: true },
    push_notifications: { type: Boolean, default: false },
    theme: { type: String, default: 'dark' },
    language: { type: String, default: 'en' }
});

module.exports = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
