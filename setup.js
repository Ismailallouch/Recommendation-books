#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configuration de BookRecommender...\n');

// Vérifier si Node.js est installé
try {
    const nodeVersion = process.version;
    console.log(`✅ Node.js ${nodeVersion} détecté`);
} catch (error) {
    console.error('❌ Node.js n\'est pas installé. Veuillez installer Node.js 14+');
    process.exit(1);
}

// Vérifier si Python est installé
try {
    const pythonVersion = execSync('python --version', { encoding: 'utf8' });
    console.log(`✅ ${pythonVersion.trim()} détecté`);
} catch (error) {
    try {
        const python3Version = execSync('python3 --version', { encoding: 'utf8' });
        console.log(`✅ ${python3Version.trim()} détecté`);
    } catch (error2) {
        console.error('❌ Python n\'est pas installé. Veuillez installer Python 3.8+');
        process.exit(1);
    }
}

// Créer le fichier .env s'il n'existe pas
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Fichier .env créé à partir de env.example');
    } else {
        // Créer un fichier .env basique
        const envContent = `# Configuration MongoDB
MONGODB_URI=mongodb://localhost:27017/recommendation_books

# Configuration JWT
JWT_SECRET=votre-secret-jwt-super-securise-${Date.now()}

# Configuration Session
SESSION_SECRET=votre-secret-session-super-securise-${Date.now()}

# Configuration du serveur
PORT=3000

# Configuration du scraping (optionnel)
AMAZON_DELAY=3
MAX_PAGES_PER_GENRE=2
`;
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Fichier .env créé avec des valeurs par défaut');
    }
} else {
    console.log('✅ Fichier .env existe déjà');
}

// Installer les dépendances Node.js
console.log('\n📦 Installation des dépendances Node.js...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dépendances Node.js installées');
} catch (error) {
    console.error('❌ Erreur lors de l\'installation des dépendances Node.js');
    process.exit(1);
}

// Installer les dépendances Python
console.log('\n🐍 Installation des dépendances Python...');
try {
    execSync('pip install -r requirements.txt', { stdio: 'inherit' });
    console.log('✅ Dépendances Python installées');
} catch (error) {
    console.error('❌ Erreur lors de l\'installation des dépendances Python');
    console.log('💡 Essayez: pip3 install -r requirements.txt');
}

// Vérifier MongoDB
console.log('\n🗄️ Vérification de MongoDB...');
try {
    // Essayer de se connecter à MongoDB
    const mongoose = require('mongoose');
    require('dotenv').config();
    
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recommendation_books', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
    });
    
    mongoose.connection.once('open', () => {
        console.log('✅ Connexion MongoDB réussie');
        mongoose.connection.close();
        finishSetup();
    });
    
    mongoose.connection.on('error', (error) => {
        console.log('⚠️ MongoDB n\'est pas accessible');
        console.log('💡 Assurez-vous que MongoDB est installé et démarré');
        console.log('   Windows: mongod');
        console.log('   macOS/Linux: sudo systemctl start mongod');
        finishSetup();
    });
    
} catch (error) {
    console.log('⚠️ Impossible de vérifier MongoDB');
    finishSetup();
}

function finishSetup() {
    console.log('\n🎉 Configuration terminée !');
    console.log('\n📋 Prochaines étapes:');
    console.log('1. Démarrer MongoDB (si pas déjà fait)');
    console.log('2. Lancer le serveur: npm run dev');
    console.log('3. Ouvrir http://localhost:3000 dans votre navigateur');
    console.log('4. (Optionnel) Ajouter des données d\'exemple: npm run seed');
    console.log('5. (Optionnel) Scraper Amazon: npm run scrape');
    console.log('\n📚 Bonne lecture !');
} 