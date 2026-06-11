const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['Credit', 'Debit'], required: true },
  category: { type: String, required: true },
  description: { type: String },
  mode: { type: String, enum: ['Cash', 'Online', 'Card'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Completed', 'Pending', 'Failed'], default: 'Completed' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
