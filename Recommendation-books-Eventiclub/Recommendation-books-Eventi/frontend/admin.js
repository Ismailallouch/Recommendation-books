let adminPassword = '';

// Connexion admin
const loginForm = document.getElementById('login-form');
const adminPanel = document.getElementById('admin-panel');
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const pwd = document.getElementById('password').value;
  if (pwd === 'admin') {
    adminPassword = pwd;
    loginForm.style.display = 'none';
    adminPanel.style.display = 'block';
    loadCriteria();
  } else {
    alert('Mot de passe incorrect');
  }
});

// Ajout d'un critère
const addForm = document.getElementById('add-criteria-form');
addForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const nom = document.getElementById('critere-nom').value.trim();
  const obligatoire = document.getElementById('critere-obligatoire').value === 'true';
  if (!nom) return;
  try {
    const res = await fetch('http://localhost:5000/api/admin/criteria', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, obligatoire, password: adminPassword })
    });
    if (!res.ok) throw new Error('Erreur ajout');
    addForm.reset();
    loadCriteria();
  } catch (err) {
    alert('Erreur lors de l\'ajout du critère');
  }
});

// Chargement et affichage des critères
async function loadCriteria() {
  const ul = document.getElementById('criteria-list');
  ul.innerHTML = '';
  const res = await fetch('http://localhost:5000/api/reviews/criteria');
  const criteres = await res.json();
  criteres.forEach(c => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `<span>${c.nom} <span class='badge bg-${c.obligatoire ? 'primary' : 'secondary'} ms-2'>${c.obligatoire ? 'Obligatoire' : 'Optionnel'}</span></span>`;
    const btn = document.createElement('button');
    btn.className = 'btn btn-danger btn-sm';
    btn.textContent = 'Supprimer';
    btn.onclick = async () => {
      if (confirm('Supprimer ce critère ?')) {
        await fetch(`http://localhost:5000/api/admin/criteria/${c._id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: adminPassword })
        });
        loadCriteria();
      }
    };
    li.appendChild(btn);
    ul.appendChild(li);
  });
} 