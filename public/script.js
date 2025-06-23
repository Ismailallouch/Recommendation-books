// Variables globales
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// Éléments DOM
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const chatInput = document.getElementById('chat-input-field');
const sendMessageBtn = document.getElementById('send-message-btn');
const chatMessages = document.getElementById('chat-messages');
const recommendationsContainer = document.getElementById('recommendations-container');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
});

function initializeApp() {
    // Vérifier si l'utilisateur est connecté
    if (authToken) {
        loadUserProfile();
        loadRecommendations();
    }
}

function setupEventListeners() {
    // Navigation mobile
    navToggle.addEventListener('click', toggleMobileMenu);
    
    // Boutons de connexion/inscription
    loginBtn.addEventListener('click', () => openModal(loginModal));
    registerBtn.addEventListener('click', () => openModal(registerModal));
    logoutBtn.addEventListener('click', logout);
    
    // Fermeture des modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeAllModals);
    });
    
    // Clic en dehors des modals pour les fermer
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    // Formulaires
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    
    // Chatbot
    sendMessageBtn.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
    
    // Bouton "Commencer"
    document.getElementById('get-started-btn').addEventListener('click', () => {
        if (!authToken) {
            openModal(registerModal);
        } else {
            document.getElementById('recommendations').scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Gestion de l'authentification
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            showMessage('Connexion réussie !', 'success');
            closeAllModals();
            updateUIAfterAuth();
            loadRecommendations();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Erreur de connexion', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const nom = document.getElementById('register-nom').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const age = parseInt(document.getElementById('register-age').value);
    const statutFamilial = document.getElementById('register-statut').value;
    
    // Récupérer les genres sélectionnés
    const genreCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');
    const genresPreferes = Array.from(genreCheckboxes).map(cb => cb.value);
    
    if (genresPreferes.length === 0) {
        showMessage('Veuillez sélectionner au moins un genre', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nom,
                email,
                password,
                age,
                statutFamilial,
                genresPreferes
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            showMessage('Inscription réussie !', 'success');
            closeAllModals();
            updateUIAfterAuth();
            loadRecommendations();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Erreur d\'inscription', 'error');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    updateUIAfterLogout();
    showMessage('Déconnexion réussie', 'success');
}

function checkAuthStatus() {
    if (authToken) {
        updateUIAfterAuth();
    } else {
        updateUIAfterLogout();
    }
}

function updateUIAfterAuth() {
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
}

function updateUIAfterLogout() {
    loginBtn.style.display = 'inline-block';
    registerBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    recommendationsContainer.innerHTML = '<p class="text-center">Connectez-vous pour voir vos recommandations personnalisées.</p>';
}

// Gestion des recommandations
async function loadRecommendations() {
    if (!authToken) return;
    
    try {
        const response = await fetch('/api/recommendations', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const books = await response.json();
            displayBooks(books);
        } else {
            showMessage('Erreur lors du chargement des recommandations', 'error');
        }
    } catch (error) {
        showMessage('Erreur de connexion', 'error');
    }
}

function displayBooks(books) {
    if (books.length === 0) {
        recommendationsContainer.innerHTML = '<p class="text-center">Aucune recommandation disponible pour le moment.</p>';
        return;
    }
    
    recommendationsContainer.innerHTML = books.map(book => `
        <div class="book-card">
            <div class="book-image">
                ${book.imageUrl ? `<img src="${book.imageUrl}" alt="Couverture de ${book.titre}">` : '<i class="fas fa-book"></i>'}
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.titre}</h3>
                <p class="book-author">Par ${book.auteur}</p>
                <p class="book-description">${book.description || 'Aucune description disponible.'}</p>
                
                <div class="book-genres">
                    ${book.genre ? book.genre.map(genre => `<span class="genre-tag">${genre}</span>`).join('') : ''}
                </div>
                
                <div class="book-meta">
                    ${book.prix ? `<span class="book-price">${book.prix}€</span>` : ''}
                    ${book.note ? `
                        <div class="book-rating">
                            <span class="stars">${'★'.repeat(Math.floor(book.note))}${'☆'.repeat(5 - Math.floor(book.note))}</span>
                            <span>${book.note}/5</span>
                        </div>
                    ` : ''}
                </div>
                
                ${book.amazonUrl ? `<a href="${book.amazonUrl}" target="_blank" class="amazon-link">Voir sur Amazon</a>` : ''}
            </div>
        </div>
    `).join('');
}

// Gestion du chatbot
async function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    if (!authToken) {
        showMessage('Veuillez vous connecter pour utiliser le chatbot', 'error');
        return;
    }
    
    // Afficher le message de l'utilisateur
    addMessageToChat(message, 'user');
    chatInput.value = '';
    
    try {
        const response = await fetch('/api/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ message })
        });
        
        if (response.ok) {
            const data = await response.json();
            addMessageToChat(data.response, 'bot');
        } else {
            addMessageToChat('Désolé, je ne peux pas répondre pour le moment.', 'bot');
        }
    } catch (error) {
        addMessageToChat('Erreur de connexion', 'bot');
    }
}

function addMessageToChat(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = `
        <div class="message-content">
            ${message}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Gestion des modals
function openModal(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
}

// Navigation mobile
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
}

// Utilitaires
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

async function loadUserProfile() {
    try {
        const userData = localStorage.getItem('user');
        if (userData) {
            currentUser = JSON.parse(userData);
        }
    } catch (error) {
        console.error('Erreur lors du chargement du profil utilisateur:', error);
    }
}

// Gestion du scroll pour la navigation
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(102, 126, 234, 0.95)';
    } else {
        navbar.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
});

// Animation au scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observer les éléments à animer
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.book-card, .hero-content, .chatbot-container');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}); 