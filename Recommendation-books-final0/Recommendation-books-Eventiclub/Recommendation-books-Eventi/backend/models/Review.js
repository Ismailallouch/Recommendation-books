const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  nom: { type: String, required: false },
  langue: { type: String, enum: ['fr', 'en'], default: 'fr' },
  notes: [{
    critere: { type: String, required: true },
    note: { type: Number, min: 1, max: 5, required: true }
  }],
  commentaire: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema); 