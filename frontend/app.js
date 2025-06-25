// Gestion multilingue
let currentLang = localStorage.getItem('lang') || 'fr';
const translations = {};

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  fetch(`lang/${lang}.json`)
    .then(res => res.json())
    .then(data => {
      Object.assign(translations, data);
      translatePage();
    });
}

function translatePage() {
  for (const key in translations) {
    const el = document.getElementById(key);
    if (el) el.textContent = translations[key];
  }
  // Placeholder pour le bouton
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) submitBtn.value = translations['submit-btn'] || submitBtn.textContent;
}

// Génération des étoiles cliquables
function renderStars(container, value = 0, editable = true) {
  container.innerHTML = '';
  const selectedValue = Number(container.dataset.value) || 0;
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('i');
    star.className = 'bi ' + (i <= value ? 'bi-star-fill text-warning' : 'bi-star text-secondary');
    star.style.fontSize = '1.5rem';
    star.style.cursor = editable ? 'pointer' : 'default';
    if (editable) {
      star.addEventListener('mouseenter', () => {
        renderStars(container, i, editable);
      });
      star.addEventListener('mouseleave', () => {
        renderStars(container, selectedValue, editable);
      });
      star.addEventListener('click', () => {
        container.dataset.value = i;
        renderStars(container, i, editable);
      });
    }
    container.appendChild(star);
  }
}

// Récupère la valeur des étoiles d'un champ
function getStarValue(field) {
  const el = document.querySelector(`.star-rating[data-field="${field}"]`);
  return el && el.dataset.value ? Number(el.dataset.value) : 0;
}

// Nouvelle fonction pour récupérer la valeur d'un champ radio
function getRadioValue(name) {
  const checked = document.querySelector(`input[name='${name}']:checked`);
  return checked ? Number(checked.value) : 0;
}

// Ajoute les étoiles sur tous les champs du formulaire
function setupStarRatings() {
  document.querySelectorAll('.star-rating').forEach(container => {
    container.dataset.value = 0;
    renderStars(container, 0, true);
    container.classList.add('star-rating-editable');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const langSwitch = document.getElementById('lang-switch');
  if (langSwitch) {
    langSwitch.value = currentLang;
    langSwitch.addEventListener('change', (e) => setLang(e.target.value));
    setLang(currentLang);
  }

  // Formulaire d'avis
  const form = document.getElementById('review-form');
  if (form) {
    setupStarRatings();
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Vérification des champs obligatoires
      const requiredFields = ['proprete','service','restauration','confort','qualite_prix','emplacement'];
      let missing = false;
      requiredFields.forEach(f => {
        if (getRadioValue(f) < 1) missing = true;
      });
      if (missing) {
        alert('Merci de donner une note (au moins 1) à chaque critère obligatoire.');
        return;
      }
      const data = {
        nom: form.nom.value,
        commentaire: form.commentaire.value,
        langue: currentLang,
        proprete: getRadioValue('proprete'),
        service: getRadioValue('service'),
        restauration: getRadioValue('restauration'),
        confort: getRadioValue('confort'),
        qualite_prix: getRadioValue('qualite_prix'),
        emplacement: getRadioValue('emplacement'),
        wifi: getRadioValue('wifi'),
        calme: getRadioValue('calme'),
        securite: getRadioValue('securite'),
        accessibilite: getRadioValue('accessibilite'),
        activites: getRadioValue('activites')
      };
      try {
        await fetch('http://localhost:5000/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        alert(translations['avis-envoye'] || 'Avis envoyé !');
        form.reset();
        setupStarRatings();
      } catch (err) {
        alert(translations['erreur-avis'] || 'Erreur lors de l\'envoi.');
      }
    });
  }

  // Page des avis
  if (window.location.pathname.endsWith('avis.html')) {
    fetch('http://localhost:5000/api/reviews')
      .then(res => res.json())
      .then(reviews => afficherAvis(reviews));
  }
});

// Affichage des avis et statistiques
function afficherAvis(reviews) {
  // Calcul de la note générale
  let total = 0, count = 0, positifs = [], moyens = [], negatifs = [];
  reviews.forEach(r => {
    const notes = [r.proprete, r.service, r.restauration, r.confort, r.qualite_prix, r.emplacement];
    const moyenne = notes.reduce((a,b) => a+b, 0) / notes.length;
    total += moyenne;
    count++;
    if (moyenne >= 4) positifs.push(r);
    else if (moyenne >= 3) moyens.push(r);
    else negatifs.push(r);
  });
  const noteGen = count ? (total/count).toFixed(2) : 'N/A';
  document.getElementById('score').textContent = noteGen + ' / 5';
  document.getElementById('statistiques').textContent = `${count} ${translations['nb-avis'] || 'avis'} - ${(positifs.length/count*100||0).toFixed(0)}% ${translations['satisfaits'] || 'satisfaits'}`;

  // Statistiques visuelles avec Chart.js
  if (window.Chart) {
    const ctx = document.getElementById('chartStats');
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: [translations['titre-positifs'] || 'Positifs', translations['titre-moyens'] || 'Moyens', translations['titre-negatifs'] || 'Négatifs'],
          datasets: [{
            data: [positifs.length, moyens.length, negatifs.length],
            backgroundColor: ['#198754', '#ffc107', '#dc3545'],
            borderWidth: 1
          }]
        },
        options: {
          cutout: '70%',
          plugins: { legend: { display: true, position: 'bottom' } }
        }
      });
    }
  }

  // Affichage des avis positifs/négatifs/moyens (liste courte)
  const ulPos = document.getElementById('liste-positifs');
  ulPos.innerHTML = '';
  positifs.slice(0, 3).forEach(r => {
    const li = document.createElement('li');
    li.innerHTML = `<span class='fw-bold'>${r.nom || 'Anonyme'}</span> : <span>${r.commentaire || ''}</span>`;
    ulPos.appendChild(li);
  });
  const ulMoy = document.getElementById('liste-moyens');
  ulMoy.innerHTML = '';
  moyens.slice(0, 3).forEach(r => {
    const li = document.createElement('li');
    li.innerHTML = `<span class='fw-bold'>${r.nom || 'Anonyme'}</span> : <span>${r.commentaire || ''}</span>`;
    ulMoy.appendChild(li);
  });
  const ulNeg = document.getElementById('liste-negatifs');
  ulNeg.innerHTML = '';
  negatifs.slice(0, 3).forEach(r => {
    const li = document.createElement('li');
    li.innerHTML = `<span class='fw-bold'>${r.nom || 'Anonyme'}</span> : <span>${r.commentaire || ''}</span>`;
    ulNeg.appendChild(li);
  });

  // Affichage détaillé des avis (cartes)
  const avisList = document.getElementById('avis-list');
  avisList.innerHTML = '';
  reviews.forEach(r => {
    const notes = [r.proprete, r.service, r.restauration, r.confort, r.qualite_prix, r.emplacement];
    const moyenne = notes.reduce((a,b) => a+b, 0) / notes.length;
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4 mb-4';
    let borderClass = '';
    if (moyenne >= 4) borderClass = 'border-success';
    else if (moyenne >= 3) borderClass = 'border-warning';
    else borderClass = 'border-danger';
    card.innerHTML = `
      <div class="card h-100 shadow-sm ${borderClass}">
        <div class="card-body">
          <div class="d-flex align-items-center mb-2">
            <img src="img/avatar${Math.floor(Math.random()*3)+1}.png" alt="Avatar" class="rounded-circle me-2" width="40" height="40">
            <div>
              <span class="fw-bold">${r.nom || 'Anonyme'}</span><br>
              <small class="text-muted">${new Date(r.date).toLocaleDateString(currentLang)}</small>
            </div>
          </div>
          <div class="mb-2">${renderStarsStatic(moyenne)}</div>
          <p class="mb-0">${r.commentaire || ''}</p>
        </div>
        <div class="card-footer bg-light border-0">
          <span class="badge bg-primary">${translations['note-generale'] || 'Note'}: ${moyenne.toFixed(1)} / 5</span>
        </div>
      </div>
    `;
    avisList.appendChild(card);
  });
  translatePage();
}

// Affichage d'étoiles statiques (lecture seule)
function renderStarsStatic(value) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<i class="bi ${i <= value ? 'bi-star-fill text-warning' : 'bi-star text-secondary'}"></i>`;
  }
  return html;
} 