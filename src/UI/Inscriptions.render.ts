import { InscriptionService } from "../services/inscription.service.js";
import { StudentService } from "../services/student.service.js";
import { SubjectService } from "../services/subject.service.js";

import type { Inscription } from "../models/Inscriptions.js";
import type { Student } from "../models/Students.js";
import type { Subject } from "../models/Subjects.js";

const insService = new InscriptionService();
const stuService = new StudentService();
const subService = new SubjectService();

let selectedStudent: number | null = null;
let selectedSubject: number | null = null;

let students: Student[] = [];
let subjects: Subject[] = [];
let inscriptions: Inscription[] = [];

const msg = document.getElementById("message") as HTMLDivElement;

const modal = document.getElementById("modal")!;
const modalConfirm = document.getElementById("modal-confirm")!;
const modalCancel = document.getElementById("modal-cancel")!;
const modalText = document.getElementById("modal-text")!;

let deleteCallback: (() => Promise<void>) | null = null;

// ===== MENSAJES =====
function showMessage(text: string, type: "error" | "success") {
  msg.textContent = text;
  msg.className = `message ${type}`;
  setTimeout(() => msg.className = "message", 2500);
}

// ===== INIT =====
async function init() {
  students = (await stuService.getStudents()).filter(s => s.state === "active");
  subjects = await subService.getSubjects();
  inscriptions = await insService.getInscriptions();

  renderStudents(students);
  renderSubjects(subjects);
  renderTable(inscriptions);
}

// ===== STUDENTS =====
function renderStudents(data: Student[]) {
  const list = document.getElementById("list-students")!;
  list.innerHTML = "";

  data.forEach(s => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `<b>${s.name}</b><br>${s.career}`;

    div.onclick = () => {
      selectedStudent = s.id;
      document.querySelectorAll("#list-students .item")
        .forEach(i => i.classList.remove("active"));
      div.classList.add("active");
    };

    list.appendChild(div);
  });
}

// ===== SUBJECTS =====
function renderSubjects(data: Subject[]) {
  const list = document.getElementById("list-subjects")!;
  list.innerHTML = "";

  data.forEach(s => {

    const count = inscriptions.filter(i => i.subject_id === s.id).length;
    // SOLO mostrar disponibles
    if (s.State !== "available") return;

    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <b>${s.name}</b><br>
      ${count}/${s.MaxStudents}<br>
      Docente: ${s.teacher}
    `;

    div.onclick = () => {
      selectedSubject = s.id;
      document.querySelectorAll("#list-subjects .item")
        .forEach(i => i.classList.remove("active"));
      div.classList.add("active");
    };

    list.appendChild(div);
  });
  
}

// ===== INSCRIBIR =====
document.getElementById("btn-inscribir")!.onclick = async () => {

  if (!selectedStudent || !selectedSubject) {
    showMessage("Selecciona estudiante y curso", "error");
    return;
  }

  const exists = inscriptions.some(i =>
    i.student_id === selectedStudent &&
    i.subject_id === selectedSubject
  );

  if (exists) {
    showMessage("Ya está inscrito", "error");
    return;
  }

  await insService.addInscription(selectedStudent, selectedSubject);
  const subject = subjects.find(s => s.id === selectedSubject);

    if (subject) {
    const count = inscriptions.filter(i => i.subject_id === subject.id).length + 1;

    if (count >= subject.MaxStudents) {
        subject.State = "closed";
        await subService.updateSubject(subject); // 🔥 GUARDAR
    }
    }


  // limpiar selección
  selectedStudent = null;
  selectedSubject = null;
  document.querySelectorAll(".item").forEach(i => i.classList.remove("active"));

  showMessage("Inscripción exitosa", "success");

  init();
};

// ===== TABLA =====
function renderTable(data: Inscription[]) {
  const table = document.getElementById("table")!;
  table.innerHTML = "";

  data.forEach(i => {
    const stu = students.find(s => s.id === i.student_id);
    const sub = subjects.find(s => s.id === i.subject_id);

    if (!stu || !sub) {
      console.warn("Inscripción inválida:", i);
      return;
    }

    const date = new Date(i.date);

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${stu.name}</td>
      <td>${stu.career}</td>
      <td>${sub.name}</td>
      <td>${sub.teacher}</td>
      <td>${date.toLocaleDateString()}</td>
      <td>${i.status}</td>
      <td>
        <button class="btn primary btn-edit">Editar</button>
      </td>
    `;

    const btnEdit = tr.querySelector(".btn-edit") as HTMLButtonElement;

    // ===== EDITAR =====
    btnEdit.addEventListener("click", async () => {
      i.status =
        i.status === "pending"
          ? "approved"
          : i.status === "approved"
          ? "rejected"
          : "pending";

      await insService.updateInscription(i);
      showMessage("Estado actualizado", "success");
      init();
    });

    table.appendChild(tr);
  });
}

// ===== BUSCAR ESTUDIANTES =====
document.getElementById("btn-search-student")!.onclick = () => {
  const text = (document.getElementById("search-student") as HTMLInputElement).value.toLowerCase();

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(text)
  );

  renderStudents(filtered);
};

// limpiar
document.getElementById("clear-student")!.onclick = () => {
  (document.getElementById("search-student") as HTMLInputElement).value = "";
  renderStudents(students);
};

document.getElementById("btn-search-subject")!.onclick = () => {
  const text = (document.getElementById("search-subject") as HTMLInputElement).value.toLowerCase();

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(text)
  );

  renderSubjects(filtered);
};

document.getElementById("clear-subject")!.onclick = () => {
  (document.getElementById("search-subject") as HTMLInputElement).value = "";
  renderSubjects(subjects);
};

document.getElementById("btn-search-ins")!.onclick = () => {
  const stuText = (document.getElementById("search-ins-student") as HTMLInputElement).value.toLowerCase();
  const subText = (document.getElementById("search-ins-subject") as HTMLInputElement).value.toLowerCase();

  const filtered = inscriptions.filter(i => {
    const stu = students.find(s => s.id === i.student_id);
    const sub = subjects.find(s => s.id === i.subject_id);

    return (
      stu?.name.toLowerCase().includes(stuText) &&
      sub?.name.toLowerCase().includes(subText)
    );
  });

  renderTable(filtered);
};

document.getElementById("clear-ins")!.onclick = () => {
  (document.getElementById("search-ins-student") as HTMLInputElement).value = "";
  (document.getElementById("search-ins-subject") as HTMLInputElement).value = "";
  renderTable(inscriptions);
};

// ===== DARK MODE =====
document.getElementById("toggle-dark")!.onclick = () => {
  document.body.classList.toggle("dark");
};

// ===== INIT =====
init();

// MODAL DELETE
function openModal(text: string, callback: () => Promise<void>) {
  modalText.textContent = text;
  modal.classList.remove("hidden");
  deleteCallback = callback;
}

function closeModal() {
  modal.classList.add("hidden");
  deleteCallback = null;
}

modalCancel.onclick = closeModal;

modalConfirm.onclick = async () => {
  if (deleteCallback) await deleteCallback();
  closeModal();
};

modal.onclick = (e) => {
  if (e.target === modal) closeModal();
};
