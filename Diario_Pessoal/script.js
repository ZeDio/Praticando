// --- storage & crypto ---
const STORAGE_KEY = 'diary_secure_blob_v2';
const fmtDate = d => new Date(d).toLocaleString();

async function deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function encryptJSON(obj, password) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveKey(password, salt);
    const enc = new TextEncoder();
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(obj)));
    return { ct: arrayBufferToBase64(ct), iv: arrayBufferToBase64(iv), salt: arrayBufferToBase64(salt) };
}
async function decryptJSON(blob, password) {
    const iv = base64ToArrayBuffer(blob.iv);
    const salt = base64ToArrayBuffer(blob.salt);
    const key = await deriveKey(password, salt);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, base64ToArrayBuffer(blob.ct));
    const dec = new TextDecoder();
    return JSON.parse(dec.decode(pt));
}
function arrayBufferToBase64(buf) {
    const bytes = new Uint8Array(buf);
    let binary = ''; for (let b of bytes) binary += String.fromCharCode(b);
    return btoa(binary);
}
function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const len = binary.length; const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
}

// --- app state ---
let diary = { entries: [], name: '' };
let currentPassword = null;

// --- dom refs ---
const loginView = document.getElementById('loginView');
const diaryView = document.getElementById('diaryView');
const setupBox = document.getElementById('setupBox');
const loginBox = document.getElementById('loginBox');
const btnSetup = document.getElementById('btnSetup');
const btnLogin = document.getElementById('btnLogin');
const btnReset = document.getElementById('btnReset');
const btnNew = document.getElementById('btnNew');
const fab = document.getElementById('fab');
const overlay = document.getElementById('overlay');
const btnCancel = document.getElementById('btnCancel');
const btnSave = document.getElementById('btnSave');
const noteTitle = document.getElementById('noteTitle');
const noteBody = document.getElementById('noteBody');
const noteMood = document.getElementById('noteMood');
const moodVal = document.getElementById('moodVal');
const entriesEl = document.getElementById('entries');
const btnExport = document.getElementById('btnExport');
const btnLock = document.getElementById('btnLock');
const filterDate = document.getElementById('filterDate');
const searchText = document.getElementById('searchText');
const btnSearch = document.getElementById('btnSearch');
const statsBox = document.getElementById('statsBox');
const themeBtn = document.getElementById('themeBtn');
const diaryTitle = document.getElementById('diaryTitle');

moodVal.textContent = noteMood.value;
noteMood.addEventListener('input', () => moodVal.textContent = noteMood.value);

// show login or setup depending if blob exists
const savedBlob = localStorage.getItem(STORAGE_KEY);
if (savedBlob) { setupBox.style.display = 'none'; loginBox.style.display = 'block'; }

// --- setup / login ---
btnSetup.addEventListener('click', async () => {
    const name = document.getElementById('setupName').value.trim();
    const a = document.getElementById('setupPwd').value;
    const b = document.getElementById('setupPwd2').value;
    if (!name) { alert('Defina um nome para o diário'); return; }
    if (!a || a.length < 4) { alert('Escolha uma senha com ao menos 4 caracteres'); return; }
    if (a !== b) { alert('Senhas não conferem'); return; }
    diary = { entries: [], name };
    const blob = await encryptJSON(diary, a);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
    currentPassword = a;
    openDiary();
});

btnLogin.addEventListener('click', async () => {
    const name = document.getElementById('loginName').value.trim();
    const pass = document.getElementById('loginPwd').value;
    if (!name || !pass) return alert('Preencha nome e senha');
    try {
        const blob = JSON.parse(localStorage.getItem(STORAGE_KEY));
        const data = await decryptJSON(blob, pass);
        if (data.name !== name) return alert('Nome do diário incorreto');
        diary = data; currentPassword = pass; openDiary();
    } catch (e) { console.error(e); alert('Senha incorreta ou dados corrompidos'); }
});

btnReset.addEventListener('click', () => {
    if (confirm('Resetar o diário? Isso apagará todas as notas localmente.')) { localStorage.removeItem(STORAGE_KEY); location.reload(); }
});

function openDiary() { loginView.style.display = 'none'; diaryView.style.display = 'block'; diaryTitle.textContent = diary.name; renderEntries(); renderStats(); }

// --- popup controls ---
function showPopup(edit = null) {
    overlay.classList.add('visible');
    const popup = document.querySelector('.popup'); popup.focus?.();
    if (edit) { document.getElementById('popupTitle').textContent = 'Editar nota'; noteTitle.value = edit.title; noteBody.value = edit.body; noteMood.value = edit.mood; moodVal.textContent = edit.mood; overlay.dataset.editId = edit.id; }
    else { document.getElementById('popupTitle').textContent = 'Nova nota'; noteTitle.value = ''; noteBody.value = ''; noteMood.value = 3; moodVal.textContent = 3; delete overlay.dataset.editId; }
}
function hidePopup() { overlay.classList.remove('visible'); }

btnNew.addEventListener('click', () => showPopup()); fab.addEventListener('click', () => showPopup()); btnCancel.addEventListener('click', () => hidePopup());

// close popup when clicking outside
overlay.addEventListener('click', (e) => { if (e.target === overlay) hidePopup(); });

btnSave.addEventListener('click', async () => {
    const title = noteTitle.value.trim();
    const body = noteBody.value.trim();
    const mood = Number(noteMood.value);
    if (!title && !body) { hidePopup(); return; } // do not add blank note
    const now = new Date().toISOString();
    const id = overlay.dataset.editId || 'id_' + Date.now();
    const note = { id, title, body, mood, date: now };
    const idx = diary.entries.findIndex(e => e.id === id);
    if (idx >= 0) diary.entries[idx] = note; else diary.entries.unshift(note);
    await persist();
    hidePopup(); renderEntries(); renderStats();
});

async function persist() {
    if (!currentPassword) throw new Error('Sem senha');
    const blob = await encryptJSON(diary, currentPassword);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
}

// --- render entries ---
function renderEntries() {
    const fd = filterDate.value; const q = (searchText.value || '').toLowerCase();
    entriesEl.innerHTML = '';
    const list = diary.entries.filter(e => {
        if (fd) { const d = new Date(e.date).toISOString().slice(0, 10); if (d !== fd) return false; }
        if (q) { return (e.title || '').toLowerCase().includes(q) || (e.body || '').toLowerCase().includes(q); }
        return true;
    });
    if (list.length === 0) { entriesEl.innerHTML = '<div class="muted">Nenhuma nota encontrada.</div>'; return; }
    for (const e of list) {
        const el = document.createElement('div'); el.className = 'entry';
        el.innerHTML = `<div class="meta">${fmtDate(e.date)} • Humor: ${e.mood}</div><h4>${escapeHtml(e.title || 'Sem título')}</h4><div>${escapeHtml(truncate(e.body || '', 300))}</div>`;
        el.addEventListener('click', () => showPopup(e));
        entriesEl.appendChild(el);
    }
}

btnSearch.addEventListener('click', () => renderEntries());
filterDate.addEventListener('change', () => renderEntries());

function truncate(s, n) { return s.length > n ? s.slice(0, n) + '...' : s; }
function escapeHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>'); }

// --- export to printable window ---
btnExport.addEventListener('click', () => {
    const win = window.open('', '_blank');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Export - Diário</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111}h1{margin-bottom:8px}section{margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid #eee}</style></head><body>` +
        `<h1>${escapeHtml(diary.name)}</h1>` + diary.entries.map(e => `<section><h3>${escapeHtml(e.title || 'Sem título')}</h3><div style="color:#666">${fmtDate(e.date)} • Humor: ${e.mood}</div><p>${escapeHtml(e.body || '')}</p></section>`).join('') +
        `</body></html>`;
    win.document.write(html); win.document.close(); win.focus(); setTimeout(() => win.print(), 500);
});

// --- lock / logout ---
btnLock.addEventListener('click', () => { currentPassword = null; diary = { entries: [], name: '' }; location.reload(); });

// --- stats ---
function renderStats() {
    const total = diary.entries.length;
    const avgMood = total ? (diary.entries.reduce((s, e) => s + e.mood, 0) / total).toFixed(2) : '-';
    statsBox.innerHTML = `<div style="padding:8px;border-radius:10px;background:var(--glass);">Entradas<br><strong>${total}</strong></div><div style="padding:8px;border-radius:10px;background:var(--glass);">Humor médio<br><strong>${avgMood}</strong></div>`;
}

// --- theme handling ---
function setTheme(t) { if (t === 'dark') { document.documentElement.setAttribute('data-theme', 'dark'); localStorage.setItem('diary_theme', 'dark'); } else { document.documentElement.removeAttribute('data-theme'); localStorage.setItem('diary_theme', 'light'); } }
const storedTheme = localStorage.getItem('diary_theme') || 'light'; setTheme(storedTheme);
themeBtn.addEventListener('click', () => { const now = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; setTheme(now); });

// --- keyboard shortcut ---
document.addEventListener('keydown', e => { if (e.key === 'n' && (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) showPopup(); });

// --- helper UID ---
function uid() { return 'id_' + Math.random().toString(36).slice(2, 9); }

// init
(async () => {
    // nothing else for now
})();