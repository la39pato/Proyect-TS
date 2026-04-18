import { SubjectService } from "../services/subject.service.js";
import type { Subject } from "../models/Subjects.js";

const service = new SubjectService();

// ===== ELEMENTOS =====
const form = document.querySelector("#form-curso") as HTMLFormElement;
const tableBody = document.querySelector("#tabla-cursos")!;
const searchInput = document.querySelector("#buscar-curso") as HTMLInputElement;
const filterState = document.querySelector("#filtro-estado-curso") as HTMLSelectElement;
const errorSearch = document.querySelector("#search-error")!;

// ===== VALIDACIONES =====

async function validateUnique(sigla: string) {
    const subjects = await service.getSubjects();

    const siglaExists = subjects.some(s => s.code.toLowerCase() === sigla.toLowerCase());

    if (siglaExists) {
        showError("sigla", "Esta sigla ya está registrada");
    }

    return !(siglaExists);
}

async function validateUniqueEdit(id: number, sigla: string) {
    const subjects = await service.getSubjects();

    const siglaExists = subjects.some(s =>
        s.id !== id && s.code.toLowerCase() === sigla.toLowerCase()
    );

    if (siglaExists) {
        showError("edit-sigla", "Esta sigla ya está registrada");
    }

    return !(siglaExists);
}

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

function validateForm(name: string,sigla: string, docente: string,cupo: number, prefix = "") {
    clearErrors();
    let valid = true;

    if (name.trim().length < 3) {
        showError(`${prefix}name`, "Nombre muy corto");
        valid = false;
    }

    if (sigla.trim().length < 2) {
        showError(`${prefix}sigla`, "Sigla muy corta");
        valid = false;
    }

    if (docente.trim().length < 3) {
        showError(`${prefix}docente`, "Docente muy corto");
        valid = false;
    }

    if (cupo < 10 || cupo > 40) {
        showError(`${prefix}cupo`, "Cupo entre 10 y 40 estudiantes");
        valid = false;
    }

    return valid;
}

// ===== RENDER =====
async function renderSubjects(list?: Subject[]) {
    const subjects = list ?? await service.getSubjects();

    tableBody.innerHTML = "";
    const fragment = document.createDocumentFragment();

    subjects.forEach(s => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${s.name}</td>
            <td>${s.code}</td>
            <td>${s.teacher}</td>
            <td>${s.MaxStudents}</td>
            <td>
                <span class="estado ${s.State === "available" ? "disponible" : "cerrado"}">
                    ${s.State === "available" ? "disponible" : "cerrado"}
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

    if (subjects.length === 0) {
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = `
            <td colspan="6" style="text-align:center; opacity:0.6;">
                No hay materias registradas
            </td>
        `;
        tableBody.appendChild(emptyRow);
    }
}

// ===== FORM SUBMIT =====
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = (document.querySelector("#name") as HTMLInputElement).value.trim();
    const code = (document.querySelector("#code") as HTMLInputElement).value.trim();
    const docente = (document.querySelector("#docente") as HTMLInputElement).value.trim();
    const cupo = (document.querySelector("#cupo") as HTMLInputElement).value.trim();

    if (!validateForm(name, code, docente, Number(cupo))) return;

    if (!(await validateUnique(code))) return;

    await service.addSubject(name, code, docente, Number(cupo),0);

    form.reset();
    renderSubjects();
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
        await service.deleteSubject(deleteId);
        renderSubjects();
    }
    closeModal();
});

// ===== EDIT =====
let currentEdit: Subject | null = null;

const editModal = document.getElementById("edit-modal")!;
const editForm = document.getElementById("edit-form") as HTMLFormElement;

const editName = document.getElementById("edit-name") as HTMLInputElement;
const editCode = document.getElementById("edit-code") as HTMLInputElement;
const editDocente = document.getElementById("edit-docente") as HTMLInputElement;
const editCupo = document.getElementById("edit-cupo") as HTMLInputElement;
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
        const subjects = await service.getSubjects();

        currentEdit = subjects.find(s => s.id === id) || null;
        if (!currentEdit) return;

        editName.value = currentEdit.name;
        editCode.value = currentEdit.code;
        editDocente.value = currentEdit.teacher;
        editCupo.value = currentEdit.MaxStudents.toString();
        editState.value = currentEdit.State;

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
        editCode.value,
        editDocente.value,
        Number(editCupo.value),
        "edit-"
    )) return;

    if (!(await validateUniqueEdit(
        currentEdit.id,
        editCode.value
    ))) return;

    await service.updateSubject({
        ...currentEdit,
        name: editName.value,
        code: editCode.value,
        teacher: editDocente.value,
        MaxStudents: Number(editCupo.value),
        State: editState.value as "available" | "closed"
    });

    renderSubjects();
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
    const code = searchInput.value.trim();
    const students = await service.getSubjects();

    const found1 = students.filter(s => 
        s.name.toLowerCase().includes(name.toLowerCase())
    );

    const found2 = students.filter(s => 
        s.code.toLowerCase().includes(code.toLowerCase())
    );

    if (found1.length === 0 && found2.length === 0) {
        errorSearch.textContent = "Curso(s) no encontrado(s)";
        setTimeout(() => errorSearch.textContent = "", 3000);
        return;
    }
    else{
        if(found1.length > 0) renderSubjects(found1);
        if(found2.length > 0) renderSubjects(found2);
    }
}

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSearch();
});

searchbutton.addEventListener("click", handleSearch);

// ===== FILTER =====
filterState.addEventListener("change", async () => {
    const value = filterState.value;

    if (value === "all") return renderSubjects();

    const students = await service.getSubjects();
    const filtered = students.filter(s => s.State === value);

    renderSubjects(filtered);
});

// ===== CLEAR FILTERS =====
document.querySelector("#clear-filters")!.addEventListener("click", () => {
    searchInput.value = "";
    filterState.value = "all";
    renderSubjects();
});

// INIT
renderSubjects();
backdrop.addEventListener("click", closeModal);

