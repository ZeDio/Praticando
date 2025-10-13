const KEY = 'projetinhos_links_v4';
const grid = document.getElementById('grid');
const empty = document.getElementById('empty');
const addBtn = document.getElementById('addBtn');
const overlay = document.getElementById('overlay');
const form = document.getElementById('form');
const modalTitle = document.getElementById('modalTitle');
const nameIn = document.getElementById('name');
const urlIn = document.getElementById('url');
const categoryIn = document.getElementById('category');
const colorIn = document.getElementById('colorInput');
const editingId = document.getElementById('editingId');
const toggleTheme = document.getElementById('toggleTheme');
const search = document.getElementById('search');
const searchWrapper = document.getElementById('searchWrapper');
const searchIcon = document.getElementById('searchIcon');

let items = [];
let theme = localStorage.getItem('proj_links_theme') || 'light';
document.documentElement.setAttribute('data-theme', theme);

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7) }

function load() {
  try { items = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { items = [] }
  if (items.length === 0) {
    items = [
      { id: uid(), name: "Minhas Recordações", url: "https://mr-jd.vercel.app", color: "#131313", offline: false },
      { id: uid(), name: "Gerador de Senhas", url: "https://gs-jd.vercel.app/", color: "#131313", offline: false },
      { id: uid(), name: "Player de Música", url: "https://ml-jd.vercel.app/", color: "#131313", offline: false },
      { id: uid(), name: "Agenda Financeira", url: "https://af-jd.vercel.app/", color: "#131313", offline: false },
      { id: uid(), name: "Gerador de Desculpas Aleatórias", url: "#", color: "#131313", offline: true, github: "https://github.com/ZeDio/Praticando/tree/main/Gerador_De_Desculpas" },
      { id: uid(), name: "Conversor de PDF para Texto", url: "https://ppt-jd.vercel.app/", color: "#131313", offline: false },
      { id: uid(), name: "Gerador de Códigos de Barras e QR Codes", url: "https://gqr-jd.vercel.app/", color: "#131313", offline: false },
      { id: uid(), name: "Gerador de Exercícios Matemáticos", url: "https://gem-jd.vercel.app/", color: "#131313", offline: false },
      { id: uid(), name: "Diário Interativo", url: "https://dp-jd.vercel.app/", color: "#131313", offline: false },
      { id: uid(), name: "Previsão do Tempo + Localização", url: "https://cp-jd.vercel.app/", color: "#131313", offline: false },
      { id: uid(), name: "Projetinhos Links", url: "https://pl-jd.vercel.app/", color: "#131313", offline: false },
    ];
    save();
  }
  render();
}

function save() { localStorage.setItem(KEY, JSON.stringify(items)); }
function shortLabel(name) { return (name || '').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase(); }
function formatUrl(u) { if (!u) return '#'; return /^https?:\/\//i.test(u) ? u : 'https://' + u }
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

// Função para mostrar pop-up offline
function showOfflineModal(name, githubUrl) {
  const tempModal = document.createElement('div');
  tempModal.className = 'overlay show';
  tempModal.innerHTML = `
    <div class="modal">
      <h2>${name}</h2>
      <p>Este projeto está temporariamente indisponível.</p>
      <div style="text-align:right; margin-top:10px; display:flex; gap:8px; justify-content:flex-end;">
        <button class="btn" id="closeTempModal">Fechar</button>
        ${githubUrl ? `<button class="btn" id="githubTempModal">Ver Código no GitHub</button>` : ''}
      </div>
    </div>
  `;
  document.body.appendChild(tempModal);

  document.getElementById('closeTempModal').onclick = () => {
    tempModal.classList.remove('show');
    setTimeout(() => tempModal.remove(), 300);
  };

  if (githubUrl) {
    document.getElementById('githubTempModal').onclick = () => {
      window.open(githubUrl, '_blank');
    };
  }
}

function render() {
  const q = (search.value || '').toLowerCase();
  let list = items.filter(i => i.name.toLowerCase().includes(q));
  grid.innerHTML = '';
  if (list.length === 0) {
    empty.style.display = 'block';
    return;
  } else {
    empty.style.display = 'none';
  }

  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class='card-actions'>
        <button class='mini-btn edit' title='Editar'>✏️</button>
        <button class='mini-btn delete' title='Excluir'>🗑️</button>
      </div>
      <div class='avatar' style='background:${item.color}'>${shortLabel(item.name)}</div>
      <div class='card-title'> - <span>${escapeHtml(item.name)}</span></div>
    `;

    // Evento correto do avatar
    card.querySelector('.avatar').addEventListener('click', () => {
      if (item.offline) {
        // Passa o link do GitHub, se houver
        showOfflineModal(item.name, item.github || null);
      } else {
        window.open(formatUrl(item.url), '_blank');
      }
    });

    card.querySelector('.edit').addEventListener('click', () => openEdit(item.id));
    card.querySelector('.delete').addEventListener('click', () => {
      card.classList.add('hide');
      setTimeout(() => {
        items = items.filter(x => x.id !== item.id);
        save();
        render();
      }, 300);
    });

    grid.appendChild(card);
  });
}

function openEdit(id) {
  const item = items.find(i => i.id === id); if (!item) return;
  modalTitle.textContent = 'Editar Link';
  nameIn.value = item.name; urlIn.value = item.url; categoryIn.value = item.category || ''; colorIn.value = item.color;
  editingId.value = item.id; openModal();
}

function openModal() { overlay.classList.add('show'); overlay.setAttribute('aria-hidden', 'false'); addBtn.classList.add('modal-anim'); setTimeout(() => addBtn.classList.remove('modal-anim'), 400); }
function closeModal() { overlay.classList.remove('show'); overlay.setAttribute('aria-hidden', 'true'); }

addBtn.addEventListener('click', () => { modalTitle.textContent = 'Adicionar Link'; form.reset(); editingId.value = ''; openModal(); });
document.getElementById('cancel').addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = editingId.value;
  const data = { id: id || uid(), name: nameIn.value.trim(), url: urlIn.value.trim(), category: categoryIn.value.trim(), color: colorIn.value, createdAt: Date.now(), offline: false };
  if (id) { items = items.map(i => i.id === id ? data : i); } else { items.push(data); }
  save(); render(); closeModal();
});

searchIcon.addEventListener('click', () => { searchWrapper.classList.toggle('active'); if (searchWrapper.classList.contains('active')) { search.focus(); } else { search.value = ''; render(); } });
search.addEventListener('blur', () => { setTimeout(() => { if (!search.value) { searchWrapper.classList.remove('active'); render(); } }, 150); });
search.addEventListener('input', () => render());

toggleTheme.addEventListener('click', () => { theme = theme === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('proj_links_theme', theme); });

load();