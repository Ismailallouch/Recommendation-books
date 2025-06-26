const express = require('express');
const router = express.Router();
const Criteria = require('../models/Criteria');

const ADMIN_PASSWORD = 'admin';

// Ajouter un critère
router.post('/criteria', async (req, res) => {
  if (req.body.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Mot de passe admin incorrect' });
  }
  try {
    const { nom, obligatoire } = req.body;
    const critere = new Criteria({ nom, obligatoire });
    await critere.save();
    res.status(201).json(critere);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Supprimer un critère
router.delete('/criteria/:id', async (req, res) => {
  if (req.body.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Mot de passe admin incorrect' });
  }
  try {
    await Criteria.findByIdAndDelete(req.params.id);
    res.json({ message: 'Critère supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 