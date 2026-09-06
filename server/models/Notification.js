const mongoose = require('mongoose');

const NOTIFICATION_TYPES = ['welcome', 'premium', 'subscription', 'system'];

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: NOTIFICATION_TYPES, default: 'system' },
  title: { type: String, required: true, maxlength: 120 },
  message: { type: String, required: true, maxlength: 500 },
  read: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ user: 1, createdAt: -1 });

notificationSchema.statics.notify = async function(userId, type, title, message) {
  try {
    return await this.create({ user: userId, type, title, message });
  } catch (err) {
    // Never let a notification failure break the main request
    console.error('[notify] failed:', err.message);
    return null;
  }
};

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
