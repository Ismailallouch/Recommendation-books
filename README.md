# 📚 BookRecommender - Système de Recommandation de Livres

Un site web moderne de recommandation de livres avec système d'authentification, chatbot intelligent et scraping de données Amazon.

## 🚀 Fonctionnalités

- **Système d'authentification** : Inscription et connexion sécurisées
- **Profil utilisateur** : Âge, statut familial, genres préférés
- **Recommandations personnalisées** : Basées sur les préférences utilisateur
- **Chatbot intelligent** : Assistant virtuel pour les recommandations
- **Scraping Amazon** : Récupération automatique des données de livres
- **Interface moderne** : Design responsive et animations fluides
- **Base de données MongoDB** : Stockage sécurisé des données

## 🛠️ Technologies Utilisées

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Design responsive avec CSS Grid et Flexbox
- Animations CSS et JavaScript
- Interface utilisateur moderne

### Backend
- Node.js avec Express.js
- MongoDB avec Mongoose
- JWT pour l'authentification
- Sessions sécurisées

### Scraping
- Python 3.x
- Selenium WebDriver
- BeautifulSoup4
- Requests
- PyMongo

## 📋 Prérequis

- Node.js (version 14 ou supérieure)
- Python 3.8 ou supérieur
- MongoDB (local ou cloud)
- Chrome/Chromium (pour le scraping)

## 🔧 Installation

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd Recommendation_books
```

### 2. Installer les dépendances Node.js
```bash
npm install
```

### 3. Installer les dépendances Python
```bash
pip install -r requirements.txt
```

### 4. Configuration de l'environnement
```bash
# Copier le fichier d'exemple
cp env.example .env

# Éditer le fichier .env avec vos configurations
nano .env
```

### 5. Configuration MongoDB
Assurez-vous que MongoDB est installé et en cours d'exécution :
```bash
# Sur Windows
mongod

# Sur macOS/Linux
sudo systemctl start mongod
```

## 🚀 Démarrage

### 1. Démarrer le serveur Node.js
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

Le serveur sera accessible sur `http://localhost:3000`

### 2. Récupérer les données Amazon (optionnel)
```bash
# Lancer le scraper Python
npm run scrape

# Ou directement avec Python
python scraper/amazon_scraper.py
```

## 📁 Structure du Projet

```
Recommendation_books/
├── public/                # Fichiers frontend
│   ├── index.html         # Page principale
│   ├── styles.css         # Styles CSS
│   └── script.js          # JavaScript frontend
├── scraper/               # Scripts Python
│   └── amazon_scraper.py  # Scraper Amazon
├── server.js              # Serveur Node.js principal
├── package.json           # Dépendances Node.js
├── requirements.txt       # Dépendances Python
├── env.example           # Variables d'environnement
└── README.md             # Documentation
```

## 🔐 Configuration de Sécurité

### Variables d'environnement importantes :
- `JWT_SECRET` : Clé secrète pour les tokens JWT
- `SESSION_SECRET` : Clé secrète pour les sessions
- `MONGODB_URI` : URL de connexion MongoDB

### Recommandations de sécurité :
- Utilisez des clés secrètes fortes et uniques
- Activez HTTPS en production
- Configurez CORS appropriément
- Limitez les tentatives de connexion

## 📊 Base de Données

### Collections MongoDB :
- `users` : Profils utilisateurs
- `books` : Données des livres scrapées

### Schémas :
```javascript
// User Schema
{
  email: String,
  password: String (hashé),
  nom: String,
  age: Number,
  statutFamilial: String,
  genresPreferes: [String],
  dateCreation: Date
}

// Book Schema
{
  titre: String,
  auteur: String,
  genre: [String],
  description: String,
  prix: Number,
  note: Number,
  imageUrl: String,
  amazonUrl: String,
  ageRecommandee: Number,
  statutFamilial: [String]
}
```

## 🤖 Chatbot

Le chatbot utilise une logique simple basée sur des mots-clés :
- Salutations : "bonjour", "salut"
- Recommandations : "recommandation", "livre"
- Genres : "genre", "type"

## 🔍 API Endpoints

### Authentification
- `POST /api/register` - Inscription utilisateur
- `POST /api/login` - Connexion utilisateur

### Recommandations
- `GET /api/recommendations` - Recommandations personnalisées (authentifié)
- `GET /api/books` - Tous les livres

### Chatbot
- `POST /api/chatbot` - Interaction avec le chatbot (authentifié)

### Gestion des livres
- `POST /api/books` - Ajouter un livre (pour le scraping)

## 🎨 Personnalisation

### Styles CSS
Modifiez `public/styles.css` pour personnaliser l'apparence :
- Couleurs du thème
- Typographie
- Animations
- Layout responsive

### Logique de recommandation
Modifiez la fonction de recommandation dans `server.js` :
```javascript
// Dans la route /api/recommendations
// Personnalisez la logique de filtrage
```

## 🚀 Déploiement

### Heroku
```bash
# Créer une application Heroku
heroku create votre-app-name

# Configurer les variables d'environnement
heroku config:set MONGODB_URI=votre-uri-mongodb
heroku config:set JWT_SECRET=votre-secret-jwt

# Déployer
git push heroku main
```

### Vercel
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

## 🐛 Dépannage

### Problèmes courants :

1. **Erreur de connexion MongoDB**
   - Vérifiez que MongoDB est démarré
   - Vérifiez l'URI de connexion

2. **Erreur de scraping**
   - Vérifiez que Chrome/Chromium est installé
   - Vérifiez la connexion internet
   - Amazon peut bloquer les requêtes automatisées

3. **Erreur JWT**
   - Vérifiez que JWT_SECRET est défini
   - Vérifiez la validité du token

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement

---

**Note** : Ce projet est à des fins éducatives. Respectez les conditions d'utilisation d'Amazon lors du scraping. 

          Realiser par : ismail allouch 