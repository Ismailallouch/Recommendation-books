const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());//Le middleware cors autorise ces requêtes entre domaines différents.
app.use(express.json()); //Ce middleware permet à Express de comprendre le format JSON dans le corps (body) des requêtes HTTP.

// Routes
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Connexion à MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 