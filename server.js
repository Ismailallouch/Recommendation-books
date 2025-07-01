const express = require('express'); 
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'votre-secret-session',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/recommendation_books'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24 heures
    }
}));

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recommendation_books', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erreur de connexion MongoDB:'));
db.once('open', () => {
    console.log('Connecté à MongoDB');
});

// Modèles MongoDB
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nom: { type: String, required: true },
    age: { type: Number, required: true },
    statutFamilial: { type: String, required: true },
    genresPreferes: [String],
    dateCreation: { type: Date, default: Date.now }
});

const bookSchema = new mongoose.Schema({
    titre: { type: String, required: true },
    auteur: { type: String, required: true },
    genre: [String],
    description: String,
    prix: Number,
    note: Number,
    imageUrl: String,
    amazonUrl: String,
    ageRecommandee: Number,
    statutFamilial: [String]
});

const User = mongoose.model('User', userSchema);
const Book = mongoose.model('Book', bookSchema);

// Routes d'authentification
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, nom, age, statutFamilial, genresPreferes } = req.body;
        
        // Vérifier si l'utilisateur existe déjà
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer le nouvel utilisateur
        const user = new User({
            email,
            password: hashedPassword,
            nom,
            age,
            statutFamilial,
            genresPreferes
        });

        await user.save();
        
        // Créer un token JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'votre-secret-jwt', { expiresIn: '24h' });
        
        res.status(201).json({ message: 'Utilisateur créé avec succès', token, user: { id: user._id, email, nom } });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'inscription', error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Trouver l'utilisateur
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Vérifier le mot de passe
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Créer un token JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'votre-secret-jwt', { expiresIn: '24h' });
        
        res.json({ message: 'Connexion réussie', token, user: { id: user._id, email, nom: user.nom } });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
    }
});

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.session.token;
    
    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'votre-secret-jwt', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide' });
        }
        req.userId = decoded.userId;
        next();
    });
};

// Routes pour les recommandations
app.get('/api/recommendations', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Étape 1: Tenter de trouver des recommandations personnalisées
        let recommendations = await Book.aggregate([
            {
                $addFields: {
                    matchScore: {
                        $add: [
                            // Score pour chaque genre correspondant (10 points, c'est la priorité)
                            {
                                $multiply: [
                                    { $size: { $ifNull: [{ $setIntersection: ["$genre", user.genresPreferes || []] }, []] } },
                                    10
                                ]
                            },
                            // Score pour la pertinence de l'âge (3 points)
                            {
                                $cond: {
                                    if: {
                                        $and: [
                                            { $gte: ["$ageRecommandee", user.age - 7] },
                                            { $lte: ["$ageRecommandee", user.age + 7] }
                                        ]
                                    },
                                    then: 3,
                                    else: 0
                                }
                            },
                            // Score pour le statut familial (2 points)
                            {
                                $cond: {
                                    if: { $in: [user.statutFamilial, { $ifNull: ["$statutFamilial", []] }] },
                                    then: 2,
                                    else: 0
                                }
                            }
                        ]
                    }
                }
            },
            { $match: { matchScore: { $gt: 0 } } },
            { $sort: { matchScore: -1, note: -1 } },
            { $limit: 20 }
        ]);

        // Étape 2: Si aucune recommandation n'est trouvée, proposer les livres les mieux notés
        if (recommendations.length === 0) {
            recommendations = await Book.find({})
                                        .sort({ note: -1 })
                                        .limit(10);
        }

        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des recommandations', error: error.message });
    }
});

// Route pour le chatbot
app.post('/api/chatbot', authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
        const user = await User.findById(req.userId);
        let response = '';
        const lowerMessage = message.toLowerCase();

        // Salutations
        if (/\b(bonjour|salut|hello|yo)\b/.test(lowerMessage)) {
            response = `Bonjour ${user.nom} ! Je suis votre assistant. Demandez-moi une "recommandation" ou un "livre de science-fiction".`;
        }
        // Demande de recommandation par genre
        else if (lowerMessage.includes('genre') || lowerMessage.includes('type de livre') || lowerMessage.includes('auteur')) {
            const genres = ['roman', 'science-fiction', 'fantasy', 'policier', 'biographie', 'histoire', 'développement personnel', 'cuisine'];
            const foundGenre = genres.find(g => lowerMessage.includes(g));

            if (foundGenre) {
                const books = await Book.find({ genre: foundGenre }).limit(3);
                if (books.length > 0) {
                    const bookTitles = books.map(b => `"${b.titre}"`).join(', ');
                    response = `Dans le genre ${foundGenre}, je peux vous suggérer : ${bookTitles}.`;
                } else {
                    response = `Je n'ai pas encore de livre pour le genre ${foundGenre}.`;
                }
            } else {
                response = `Nous avons de nombreux genres : Roman, Science-fiction, Fantasy, Policier... Quel genre vous intéresse ?`;
            }
        }
        // Demande de recommandation générale
        else if (/\b(recommande|recommandation|suggère|suggestion|livre)\b/.test(lowerMessage)) {
            const recommendations = await Book.aggregate([{ $sample: { size: 1 } }]);
            if (recommendations.length > 0) {
                const book = recommendations[0];
                response = `Bien sûr ! Que diriez-vous de "${book.titre}" par ${book.auteur} ? C'est un excellent livre du genre ${book.genre.join(', ')}.`;
            } else {
                response = "Je n'ai pas de recommandation spécifique pour le moment, mais notre catalogue s'agrandit chaque jour !";
            }
        }
        // Parler des préférences
        else if (/\b(mes préférences|mon profil|mes goûts)\b/.test(lowerMessage)) {
            response = `Selon votre profil, vous avez ${user.age} ans, votre statut est "${user.statutFamilial}" et vous appréciez les genres : ${user.genresPreferes.join(', ')}. Est-ce que cela vous correspond ?`;
        }
        // Aide
        else if (/\b(aide|help|que fais-tu)\b/.test(lowerMessage)) {
            response = 'Je suis un assistant virtuel conçu pour vous aider à trouver votre prochain livre. Demandez-moi une "recommandation", ou des "livres de fantasy" par exemple.';
        }
        // Infos sur le site
        else if (/\b(à propos|ce site|fonctionne)\b/.test(lowerMessage)) {
            response = 'Ce site vous permet de découvrir des livres basés sur vos goûts. Après votre inscription, nous vous proposons des recommandations personnalisées. Vous pouvez aussi discuter avec moi pour affiner votre recherche !';
        }
        // Créateur
        else if (/\b(créateur|développeur|qui t'a fait)\b/.test(lowerMessage)) {
            response = 'J\'ai été développé avec passion par une équipe de développeurs pour vous offrir la meilleure expérience de découverte de livres.';
        }
        // Remerciements
        else if (/\b(merci|super|top|génial)\b/.test(lowerMessage)) {
            response = 'De rien ! Je suis là pour vous aider. N\'hésitez pas si vous avez d\'autres questions.';
        }
        // Réponse par défaut
        else {
            response = "Je ne suis pas certain de comprendre. Pouvez-vous reformuler ? Essayez de me demander une 'recommandation de livre'.";
        }
        
        res.json({ response });
    } catch (error) {
        res.status(500).json({ message: 'Erreur du chatbot', error: error.message });
    }
});

// Route pour récupérer tous les livres
app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find().limit(50);
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des livres', error: error.message });
    }
});

// Route pour ajouter un livre (pour le scraping)
app.post('/api/books', async (req, res) => {
    try {
        const book = new Book(req.body);
        await book.save();
        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'ajout du livre', error: error.message });
    }
});

// Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
}); 
