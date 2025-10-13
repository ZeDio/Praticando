const KEY = 'projetinhos_links_v5';
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

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function load() { try { items = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { items = [] } render(); }
function save() { localStorage.setItem(KEY, JSON.stringify(items)); }

function shortLabel(name) { return (name || '').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase(); }
function formatUrl(u) { if (!u) return '#'; return /^https?:\/\//i.test(u) ? u : 'https://' + u; }
function getColor(name) { const colors = ['#6366f1', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']; let h = 0; for (let i = 0; i < name.length; i++) h = (h << 5) - h + name.charCodeAt(i); return colors[Math.abs(h) % colors.length]; }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])); }

function render() {
    const q = (search.value || '').toLowerCase();
    let list = items.filter(i => i.name.toLowerCase().includes(q));
    grid.innerHTML = '';
    if (list.length === 0) { empty.style.display = 'block'; return; } else empty.style.display = 'none';
    list.forEach(item => {
        const card = document.createElement('div'); card.className = 'card';
        card.innerHTML = `
          <div class='link-info'>
            <div class='avatar' style='background:${item.color || getColor(item.name)}'>${shortLabel(item.name)}</div>
            <div class='card-title'>${escapeHtml(item.name)}</div>
          </div>
          <div class='card-actions'>
            <button class='mini-btn edit' title='Editar'>✏️</button>
            <button class='mini-btn delete' title='Excluir'>🗑️</button>
          </div>`;

        card.querySelector('.link-info').addEventListener('click', () => window.open(formatUrl(item.url), '_blank'));
        card.querySelector('.edit').addEventListener('click', () => openEdit(item.id));
        card.querySelector('.delete').addEventListener('click', () => {
            card.classList.add('fade-out');
            setTimeout(() => {
                items = items.filter(x => x.id !== item.id);
                save(); render();
            }, 250);
        });
        grid.appendChild(card);
    });
}

function openEdit(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    modalTitle.textContent = 'Editar Link';
    nameIn.value = item.name; urlIn.value = item.url; categoryIn.value = item.category; colorIn.value = item.color; editingId.value = item.id;
    openModal();
}

function openModal() { overlay.classList.add('show'); }
function closeModal() { overlay.classList.remove('show'); }

addBtn.addEventListener('click', () => { modalTitle.textContent = 'Adicionar Link'; form.reset(); editingId.value = ''; openModal(); });
document.getElementById('cancel').addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
form.addEventListener('submit', e => {
    e.preventDefault();
    const id = editingId.value;
    const data = { id: id || uid(), name: nameIn.value.trim(), url: urlIn.value.trim(), category: categoryIn.value.trim(), color: colorIn.value || getColor(nameIn.value), createdAt: Date.now() };
    if (id) { items = items.map(i => i.id === id ? data : i); } else { items.push(data); }
    save(); render(); closeModal();
});

searchIcon.addEventListener('click', () => { searchWrapper.classList.toggle('active'); if (searchWrapper.classList.contains('active')) { search.focus(); } else { search.value = ''; render(); } });
search.addEventListener('blur', () => { setTimeout(() => { if (!search.value) { searchWrapper.classList.remove('active'); render(); } }, 150); });
search.addEventListener('input', () => render());

toggleTheme.addEventListener('click', () => { theme = theme === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('proj_links_theme', theme); });

load();