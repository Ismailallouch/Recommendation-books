
# 🚀 Guide de Démarrage Rapide - BookRecommender

## Installation Express (5 minutes)

### 1. Configuration automatique
```bash
# Cloner le projet (si pas déjà fait)
git clone <url-du-repo>
cd Recommendation_books

# Configuration automatique
npm run setup
```

### 2. Configuration manuelle (si nécessaire)
```bash
# Installer les dépendances
npm install
pip install -r requirements.txt

# Créer le fichier .env
cp env.example .env
```

### 3. Démarrer MongoDB
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

### 4. Lancer l'application
```bash
# Mode développement
npm run dev

# Ou mode production
npm start
```

### 5. Ouvrir dans le navigateur
🌐 **http://localhost:3000**

## 🎯 Test Rapide

### 1. Ajouter des données d'exemple
```bash
npm run seed
```

### 2. Tester l'application
1. Ouvrir http://localhost:3000
2. Cliquer sur "Inscription"
3. Remplir le formulaire avec vos préférences
4. Voir vos recommandations personnalisées !

### 3. Tester le chatbot
1. Se connecter
2. Aller à la section "Assistant"
3. Taper "bonjour" ou "recommandation"

## 🔧 Commandes Utiles

```bash
# Développement
npm run dev          # Démarrer en mode développement
npm run seed         # Ajouter des données d'exemple
npm run scrape       # Scraper Amazon (optionnel)

# Production
npm start            # Démarrer en mode production
npm run setup        # Configuration automatique
```

## 🐛 Problèmes Courants

### MongoDB ne démarre pas
```bash
# Windows - Vérifier que MongoDB est installé
# macOS - Installer avec Homebrew
brew install mongodb-community

# Linux - Installer avec apt
sudo apt install mongodb
```

### Erreur de dépendances Python
```bash
# Essayer avec pip3
pip3 install -r requirements.txt

# Ou créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

### Port 3000 occupé
```bash
# Changer le port dans .env
PORT=3001

# Ou tuer le processus
lsof -ti:3000 | xargs kill -9
```

## 📱 Fonctionnalités Principales

✅ **Inscription/Connexion** - Système d'authentification sécurisé  
✅ **Profil utilisateur** - Âge, statut familial, genres préférés  
✅ **Recommandations** - Livres personnalisés selon vos goûts  
✅ **Chatbot** - Assistant virtuel pour les recommandations  
✅ **Design responsive** - Fonctionne sur mobile et desktop  
✅ **Scraping Amazon** - Données de livres en temps réel  

## 🎨 Personnalisation

### Changer les couleurs
Éditer `public/styles.css` :
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #ffd700;
}
```

### Ajouter des genres
Modifier `server.js` et `public/index.html` :
```javascript
// Dans server.js - logique de recommandation
// Dans index.html - options du formulaire
```

## 📞 Support

- 📖 **Documentation complète** : Voir `README.md`
- 🐛 **Problèmes** : Ouvrir une issue sur GitHub
- 💡 **Suggestions** : Proposer des améliorations

---

**🎉 Vous êtes prêt ! Amusez-vous bien avec votre système de recommandation de livres !** 
**Realiser par : Ismail allouch **
