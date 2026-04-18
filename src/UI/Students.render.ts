import { StudentService } from "../services/student.service.js";
import type { Student } from "../models/Students.js";

const service = new StudentService();

// ===== ELEMENTOS =====
const form = document.querySelector("#student-form") as HTMLFormElement;
const tableBody = document.querySelector("#table-body")!;
const searchInput = document.querySelector("#search") as HTMLInputElement;
const filterState = document.querySelector("#filter-state") as HTMLSelectElement;
const errorSearch = document.querySelector("#search-error")!;

// ===== VALIDACIONES =====

async function validateUnique(name: string, email: string) {
    const students = await service.getStudents();

    const nameExists = students.some(s => s.name.toLowerCase() === name.toLowerCase());
    const emailExists = students.some(s => s.email.toLowerCase() === email.toLowerCase());

    if (emailExists) {
        showError("email", "Este correo ya está registrado");
    }

    return !(nameExists || emailExists);
}

async function validateUniqueEdit(id: number, name: string, email: string) {
    const students = await service.getStudents();

    const nameExists = students.some(s =>
        s.id !== id && s.name.toLowerCase() === name.toLowerCase()
    );

    const emailExists = students.some(s =>
        s.id !== id && s.email.toLowerCase() === email.toLowerCase()
    );

    if (emailExists) {
        showError("edit-email", "Este correo ya está registrado");
    }

    return !(nameExists || emailExists);
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const careerRegex = /^[A-Za-z\s]+$/;

function clearErrors() {
    document.querySelectorAll(".error").forEach(e => e.textContent = "");
    document.querySelectorAll("#student-form input, #edit-form input")
        .forEach(i => i.classList.remove("error"));
}

function showError(id: string, message: string) {
    const input = document.getElementById(id) as HTMLInputElement;
    const error = document.getElementById(`error-${id}`)!;

    input.classList.add("error");
    error.textContent = message;
}

function validateForm(name: string, email: string, years: number, career: string , prefix = "") {
    clearErrors();
    let valid = true;

    if (name.trim().length < 3) {
        showError(`${prefix}name`, "Nombre muy corto");
        valid = false;
    }
    if (!emailRegex.test(email)) {
        showError(`${prefix}email`, "Correo inválido");
        valid = false;
    }

    if (years < 18 || years > 100) {
        showError(`${prefix}years`, "Edad entre 18 y 100 años");
        valid = false;
    }

    if (!careerRegex.test(career)) {
        showError(`${prefix}career`, "Carrera solo debe contener letras y espacios");
        valid = false;
    }

    return valid;
}

// ===== RENDER =====
async function renderStudents(list?: Student[]) {
    const students = list ?? await service.getStudents();

    tableBody.innerHTML = "";
    const fragment = document.createDocumentFragment();

    students.forEach(s => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${s.name}</td>
            <td>${s.email}</td>
            <td>${s.years}</td>
            <td>${s.career}</td>
            <td>
                <span class="estado ${s.state === "active" ? "activo" : "inactivo"}">
                    ${s.state === "active" ? "Activo" : "Inactivo"}
                </span>
            </td>
            <td>
                <button class="edit" data-id="${s.id}">Editar</button>
                <button class="delete" data-id="${s.id}">Eliminar</button>
            </td>
        `;

        fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);

    if (students.length === 0) {
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = `
            <td colspan="6" style="text-align:center; opacity:0.6;">
                No hay estudiantes registrados
            </td>
        `;
        tableBody.appendChild(emptyRow);
    }
}

// ===== FORM SUBMIT =====
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = (document.querySelector("#name") as HTMLInputElement).value.trim();
    const email = (document.querySelector("#email") as HTMLInputElement).value.trim();
    const years = parseInt((document.querySelector("#years") as HTMLInputElement).value);
    const career = (document.querySelector("#career") as HTMLInputElement).value.trim();

    if (!validateForm(name, email, years, career)) return;

    if (!(await validateUnique(name, email))) return;

    await service.addStudent(name, email, years, career, "active");

    form.reset();
    renderStudents();
});

// ===== CLEAR FORM =====
document.querySelector("#clear-form")!.addEventListener("click", () => {
    form.reset();
    clearErrors();
});

// ===== DELETE =====
let deleteId: number | null = null;

const deleteModal = document.getElementById("delete-modal")!;
const backdrop = document.getElementById("modal-backdrop")!;
const confirmDeleteBtn = document.getElementById("confirm-delete")!;
const cancelDeleteBtn = document.getElementById("cancel-delete")!;

cancelDeleteBtn.addEventListener("click", closeModal);

confirmDeleteBtn.addEventListener("click", async () => {
    if (deleteId !== null) {
        await service.deleteStudent(deleteId);
        renderStudents();
    }
    closeModal();
});

// ===== EDIT =====
let currentEdit: Student | null = null;

const editModal = document.getElementById("edit-modal")!;
const editForm = document.getElementById("edit-form") as HTMLFormElement;

const editName = document.getElementById("edit-name") as HTMLInputElement;
const editEmail = document.getElementById("edit-email") as HTMLInputElement;
const editYears = document.getElementById("edit-years") as HTMLInputElement;
const editCareer = document.getElementById("edit-career") as HTMLInputElement;
const editState = document.getElementById("edit-state") as HTMLSelectElement;

// abrir modal
tableBody.addEventListener("click", async (e: any) => {
    const id = Number(e.target.dataset.id);

    if (e.target.classList.contains("delete")) {
        deleteId = id;

        backdrop.classList.remove("hidden");
        deleteModal.classList.remove("hidden");
        deleteModal.classList.add("active");
    }

    if (e.target.classList.contains("edit")) {
        const students = await service.getStudents();

        currentEdit = students.find(s => s.id === id) || null;
        if (!currentEdit) return;

        editName.value = currentEdit.name;
        editEmail.value = currentEdit.email;
        editYears.value = currentEdit.years.toString();
        editCareer.value = currentEdit.career;
        editState.value = currentEdit.state;

        backdrop.classList.remove("hidden");
        editModal.classList.remove("hidden");
        editModal.classList.add("active");
    }
});

// guardar cambios
editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!currentEdit) return;

    if (!validateForm(
        editName.value,
        editEmail.value,
        Number(editYears.value),
        editCareer.value,
        "edit-"
    )) return;

    if (!(await validateUniqueEdit(
        currentEdit.id,
        editName.value,
        editEmail.value
    ))) return;

    await service.updateStudent({
        ...currentEdit,
        name: editName.value,
        email: editEmail.value,
        years: Number(editYears.value),
        career: editCareer.value,
        state: editState.value as "active" | "inactive"
    });

    renderStudents();
    closeModal();
});

// cancelar
document.getElementById("cancel-edit")!.addEventListener("click", closeModal);

// cerrar modales
function closeModal() {
    backdrop.classList.add("hidden");

    deleteModal.classList.add("hidden");
    editModal.classList.add("hidden");

    deleteModal.classList.remove("active");
    editModal.classList.remove("active");

    deleteId = null;
    currentEdit = null;
}

// ===== SEARCH =====
const searchbutton = document.getElementById("search-btn") as HTMLButtonElement;

async function handleSearch() {
    errorSearch.textContent = "";

    const name = searchInput.value.trim();
    const students = await service.getStudents();

    const found = students.filter(s => 
        s.name.toLowerCase().includes(name.toLowerCase())
    );

    if (found.length === 0) {
        errorSearch.textContent = "Estudiante(s) no encontrado(s)";
        setTimeout(() => errorSearch.textContent = "", 3000);
        return;
    }

    renderStudents(found);
}

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSearch();
});

searchbutton.addEventListener("click", handleSearch);


searchbutton.addEventListener("click", async () =>{

    errorSearch.textContent = "";

    const name = searchInput.value.trim();
    const students = await service.getStudents();

    const found = students.filter(s => s.name.toLowerCase() === name.toLowerCase());

    if (found.length === 0) {
        errorSearch.textContent = "Estudiante(s) no encontrado(s)";
        setTimeout(() => errorSearch.textContent = "", 3000);
        return;
    }

    searchInput.value = "";

    renderStudents(found);
});

// ===== FILTER =====
filterState.addEventListener("change", async () => {
    const value = filterState.value;

    if (value === "all") return renderStudents();

    const students = await service.getStudents();
    const filtered = students.filter(s => s.state === value);

    renderStudents(filtered);
});

// ===== CLEAR FILTERS =====
document.querySelector("#clear-filters")!.addEventListener("click", () => {
    searchInput.value = "";
    filterState.value = "all";
    renderStudents();
});

// INIT
renderStudents();
backdrop.addEventListener("click", closeModal);

// DARK MODE

const toggleDarkBtn = document.getElementById("toggle-dark")!;

toggleDarkBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    toggleDarkBtn.textContent = isDark ? "Modo claro" : "Modo oscuro";

    localStorage.setItem("theme", isDark ? "dark" : "light");
});

// cargar preferencia
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}