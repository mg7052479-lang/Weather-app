const noteColor = document.getElementById("notes-color");
const notesContainer = document.getElementById("notes-container");
const notesText = document.getElementById("notes-text");
const addbtn = document.getElementById("addbtn");

/* ======================
   CREATE NOTE
====================== */
function createNote(text, color) {
  const note = document.createElement("div");
  note.className = "note";
  note.style.background = color;

  const p = document.createElement("p");
  p.textContent = text;

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";

  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";

  // DELETE NOTE
  delBtn.addEventListener("click", function () {
    note.remove();
    saveToLocalStorage();
  });

  // EDIT NOTE
  editBtn.addEventListener("click", function () {
    if (editBtn.textContent === "Edit") {
      const input = document.createElement("input");
      input.type = "text";
      input.value = p.textContent;

      note.replaceChild(input, p);
      editBtn.textContent = "Save";
      input.focus();

      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          saveEdit(note, p, input, editBtn);
        }
      });
    } else {
      const input = note.querySelector("input");
      saveEdit(note, p, input, editBtn);
    }
  });

  note.appendChild(p);
  note.appendChild(editBtn);
  note.appendChild(delBtn);
  notesContainer.appendChild(note);
}

/* ======================
   SAVE EDIT
====================== */
function saveEdit(note, p, input, editBtn) {
  p.textContent = input.value.trim() || p.textContent;
  note.replaceChild(p, input);
  editBtn.textContent = "Edit";
  saveToLocalStorage();
}

/* ======================
   ADD NOTE
====================== */
addbtn.addEventListener("click", function () {
  const text = notesText.value.trim();
  const color = noteColor.value;

  if (!text) return;

  createNote(text, color);
  saveToLocalStorage();

  notesText.value = "";
});

/* ======================
   LOCAL STORAGE
====================== */
function saveToLocalStorage() {
  const notes = [];

  document.querySelectorAll(".note").forEach(note => {
    notes.push({
      text: note.querySelector("p").textContent,
      color: note.style.background
    });
  });

  localStorage.setItem("notes", JSON.stringify(notes));
}

function loadFromLocalStorage() {
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  notes.forEach(note => createNote(note.text, note.color));
}

// LOAD NOTES ON PAGE START
loadFromLocalStorage();

