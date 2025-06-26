const mongoose = require('mongoose');

const CriteriaSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true },
  obligatoire: { type: Boolean, default: true }
});

module.exports = mongoose.model('Criteria', CriteriaSchema); 
