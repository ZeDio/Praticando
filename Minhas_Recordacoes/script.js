const imageInput = document.getElementById('imageInput');
const noteText = document.getElementById('noteText');
const addNoteBtn = document.getElementById('addNote');
const notesContainer = document.getElementById('notesContainer');
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Alternar tema
themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark');
  localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
});

// Carregar tema salvo
window.onload = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') body.classList.add('dark');

  const savedNotes = JSON.parse(localStorage.getItem('notes')) || [];
  savedNotes.forEach(note => renderNote(note));
};

function saveNotes(notes) {
  localStorage.setItem('notes', JSON.stringify(notes));
}

function getNotes() {
  return JSON.parse(localStorage.getItem('notes')) || [];
}

function renderNote(note) {
  const div = document.createElement('div');
  div.classList.add('note', 'show');
  div.setAttribute('data-id', note.id);

  if (note.image) {
    const img = document.createElement('img');
    img.src = note.image;
    div.appendChild(img);
  }

  const p = document.createElement('p');
  p.innerText = note.text;
  div.appendChild(p);

  const deleteBtn = document.createElement('button');
  deleteBtn.innerText = "Excluir";
  deleteBtn.classList.add('delete-btn');
  deleteBtn.onclick = () => deleteNote(note.id, div);
  div.appendChild(deleteBtn);

  notesContainer.appendChild(div);
}

function deleteNote(id, noteEl) {
  noteEl.classList.add('hide');
  setTimeout(() => {
    noteEl.remove();
    const notes = getNotes().filter(n => n.id !== id);
    saveNotes(notes);
  }, 400);
}

addNoteBtn.addEventListener('click', () => {
  const file = imageInput.files[0];
  const text = noteText.value.trim();

  if (!file && !text) {
    alert("Adicione uma foto ou escreva uma lembrança!");
    return;
  }

  const id = Date.now();

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newNote = { id, image: e.target.result, text: text };
      const notes = getNotes();
      notes.push(newNote);
      saveNotes(notes);
      renderNote(newNote);
    };
    reader.readAsDataURL(file);
  } else {
    const newNote = { id, image: null, text: text };
    const notes = getNotes();
    notes.push(newNote);
    saveNotes(notes);
    renderNote(newNote);
  }

  imageInput.value = '';
  noteText.value = '';
});