const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferences: {
    theme: { type: String, default: 'dark' },
    currency: { type: String, default: 'INR' }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
