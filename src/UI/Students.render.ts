import type { Student } from "../models/Students.js";
import { StudentService } from "../services/student.service.js";

const service = new StudentService();

const form = document.getElementById("form-estudiante") as HTMLFormElement;
const tabla = document.getElementById("tabla-estudiantes") as HTMLTableSectionElement;
const btnGuardar = document.getElementById("guardar-todo") as HTMLButtonElement;

let tempStudents: Student[] = [];
let editandoId: number | null = null;

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  const student: Student = {
    id: Date.now(),
    name: formData.get("nombre") as string,
    email: formData.get("correo") as string,
    years: Number(formData.get("edad")),
    career: formData.get("carrera") as string,
    state: formData.get("estado") as "active" | "inactive"
  };

  if (editandoId !== null) {
    const index = tempStudents.findIndex(s => s.id === editandoId);
    tempStudents[index] = student;
    editandoId = null;
  } else {
    tempStudents.push(student);
  }

  form.reset();
  render();
});


function render() {
  tabla.innerHTML = "";

  tempStudents.forEach(student => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td>${student.years}</td>
      <td>${student.career}</td>
      <td>
        <span class="estado ${student.state}">
          ${student.state}
        </span>
      </td>
      <td>
        <button class="edit">Editar</button>
        <button class="delete">Eliminar</button>
      </td>
    `;


    row.querySelector(".edit")?.addEventListener("click", () => {
      (form.nombre as any).value = student.name;
      (form.correo as any).value = student.email;
      (form.edad as any).value = student.years;
      (form.carrera as any).value = student.career;
      (form.estado as any).value = student.state;

      editandoId = student.id;
    });


    row.querySelector(".delete")?.addEventListener("click", () => {
      const confirmacion = confirm("¿Seguro que quieres eliminar este estudiante?");
      if (!confirmacion) return;

      tempStudents = tempStudents.filter(s => s.id !== student.id);
      render();
    });

    tabla.appendChild(row);
  });
}


btnGuardar.addEventListener("click", async () => {
  if (tempStudents.length === 0) {
    alert("No hay estudiantes para guardar");
    return;
  }

  for (const student of tempStudents) {
    await service.addStudent(
      student.name,
      student.email,
      student.years,
      student.career,
      student.state
    );
  }

  alert("Todos los estudiantes fueron guardados correctamente");

  tempStudents = [];
  render();
});