const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  nom: { type: String, required: false },
  langue: { type: String, enum: ['fr', 'en'], default: 'fr' },
  proprete: { type: Number, min: 1, max: 5, required: true },
  service: { type: Number, min: 1, max: 5, required: true },
  restauration: { type: Number, min: 1, max: 5, required: true },
  confort: { type: Number, min: 1, max: 5, required: true },
  qualite_prix: { type: Number, min: 1, max: 5, required: true },
  emplacement: { type: Number, min: 1, max: 5, required: true },
  wifi: { type: Number, min: 1, max: 5, required: false },
  calme: { type: Number, min: 1, max: 5, required: false },
  securite: { type: Number, min: 1, max: 5, required: false },
  accessibilite: { type: Number, min: 1, max: 5, required: false },
  activites: { type: Number, min: 1, max: 5, required: false },
  commentaire: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema); 