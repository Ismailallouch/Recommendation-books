const mongoose = require('mongoose');
require('dotenv').config();

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recommendation_books', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Modèles
const Book = mongoose.model('Book', new mongoose.Schema({
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
}));

// Données d'exemple
const sampleBooks = [
    {
        titre: "Le Petit Prince",
        auteur: "Antoine de Saint-Exupéry",
        genre: ["roman", "fantasy"],
        description: "Un conte poétique et philosophique sous l'apparence d'un livre pour enfants.",
        prix: 6.90,
        note: 4.8,
        amazonUrl: "https://www.amazon.fr/Petit-Prince-Antoine-Saint-Exupéry/dp/2070612758",
        ageRecommandee: 8,
        statutFamilial: ["célibataire", "en couple", "marié", "parent", "étudiant"]
    },
    {
        titre: "1984",
        auteur: "George Orwell",
        genre: ["science-fiction", "roman"],
        description: "Une dystopie qui dépeint une société totalitaire sous surveillance constante.",
        prix: 7.40,
        note: 4.6,
        amazonUrl: "https://www.amazon.fr/1984-George-Orwell/dp/207036822X",
        ageRecommandee: 18,
        statutFamilial: ["célibataire", "en couple", "marié", "étudiant"]
    },
    {
        titre: "Le Seigneur des Anneaux",
        auteur: "J.R.R. Tolkien",
        genre: ["fantasy", "roman"],
        description: "Une épopée fantastique dans un monde médiéval imaginaire.",
        prix: 25.00,
        note: 4.9,
        amazonUrl: "https://www.amazon.fr/Seigneur-Anneaux-J-R-R-Tolkien/dp/207061288X",
        ageRecommandee: 14,
        statutFamilial: ["célibataire", "en couple", "marié", "étudiant"]
    },
    {
        titre: "Le Nom de la Rose",
        auteur: "Umberto Eco",
        genre: ["policier", "roman", "histoire"],
        description: "Un roman policier médiéval dans une abbaye bénédictine.",
        prix: 8.90,
        note: 4.4,
        amazonUrl: "https://www.amazon.fr/Nom-Rose-Umberto-Eco/dp/2253004244",
        ageRecommandee: 25,
        statutFamilial: ["célibataire", "en couple", "marié", "parent"]
    },
    {
        titre: "Steve Jobs",
        auteur: "Walter Isaacson",
        genre: ["biographie"],
        description: "La biographie officielle du cofondateur d'Apple.",
        prix: 24.90,
        note: 4.5,
        amazonUrl: "https://www.amazon.fr/Steve-Jobs-Walter-Isaacson/dp/2709638825",
        ageRecommandee: 30,
        statutFamilial: ["célibataire", "en couple", "marié", "parent"]
    },
    {
        titre: "L'Art de la Guerre",
        auteur: "Sun Tzu",
        genre: ["développement personnel", "histoire"],
        description: "Un traité militaire chinois ancien sur la stratégie.",
        prix: 5.90,
        note: 4.3,
        amazonUrl: "https://www.amazon.fr/Art-guerre-Sun-Tzu/dp/2253004244",
        ageRecommandee: 20,
        statutFamilial: ["célibataire", "en couple", "marié", "parent", "étudiant"]
    },
    {
        titre: "La Cuisine de Référence",
        auteur: "Michel Maincent-Morel",
        genre: ["cuisine"],
        description: "Un guide complet de techniques culinaires professionnelles.",
        prix: 45.00,
        note: 4.7,
        amazonUrl: "https://www.amazon.fr/Cuisine-référence-Michel-Maincent-Morel/dp/2212548648",
        ageRecommandee: 18,
        statutFamilial: ["célibataire", "en couple", "marié", "parent"]
    },
    {
        titre: "Les Misérables",
        auteur: "Victor Hugo",
        genre: ["roman", "histoire"],
        description: "Un roman historique sur la société française du XIXe siècle.",
        prix: 12.90,
        note: 4.6,
        amazonUrl: "https://www.amazon.fr/Misérables-Victor-Hugo/dp/2253004244",
        ageRecommandee: 25,
        statutFamilial: ["célibataire", "en couple", "marié", "parent"]
    },
    {
        titre: "Fondation",
        auteur: "Isaac Asimov",
        genre: ["science-fiction"],
        description: "Une saga de science-fiction sur la chute d'un empire galactique.",
        prix: 8.90,
        note: 4.5,
        amazonUrl: "https://www.amazon.fr/Fondation-Isaac-Asimov/dp/2253004244",
        ageRecommandee: 20,
        statutFamilial: ["célibataire", "en couple", "étudiant"]
    },
    {
        titre: "Le Guide du Routard",
        auteur: "Collectif",
        genre: ["développement personnel"],
        description: "Guide de voyage pour découvrir le monde.",
        prix: 15.90,
        note: 4.2,
        amazonUrl: "https://www.amazon.fr/Guide-Routard-Paris-2024/dp/2017861234",
        ageRecommandee: 18,
        statutFamilial: ["célibataire", "en couple", "marié", "parent", "étudiant"]
    }
];

async function seedDatabase() {
    try {
        console.log('Connexion à MongoDB...');
        
        // Supprimer les anciennes données
        await Book.deleteMany({});
        console.log('Anciennes données supprimées');
        
        // Insérer les nouvelles données
        const result = await Book.insertMany(sampleBooks);
        console.log(`${result.length} livres ajoutés à la base de données`);
        
        console.log('Base de données initialisée avec succès !');
        
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    } finally {
        mongoose.connection.close();
        console.log('Connexion MongoDB fermée');
    }
}

// Exécuter le script
seedDatabase(); 
