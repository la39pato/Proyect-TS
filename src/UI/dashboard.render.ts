import { StudentService } from "../services/student.service.js";
import { SubjectService } from "../services/subject.service.js";
import { InscriptionService } from "../services/inscription.service.js";

const studentService = new StudentService();
const subjectService = new SubjectService();
const inscriptionService = new InscriptionService();

export async function renderDashboard() {

    const students = await studentService.getStudents();
    const subjects = await subjectService.getSubjects();
    const inscriptions = await inscriptionService.getInscriptions();

    // ===== TOTALES =====
    const totalStudents = students.length;
    const totalSubjects = subjects.length;
    const totalInscriptions = inscriptions.length;

    // ===== ESTUDIANTES ACTIVOS =====
    const activeStudents = students.filter(s => s.state === "active").length;

    // ===== CURSOS CERRADOS =====
    const closedSubjects = subjects.filter(s => s.State === "closed").length;

    // ===== CURSO CON MÁS INSCRITOS =====
    const countMap: Record<number, number> = {};

    inscriptions.forEach(i => {
        countMap[i.subject_id] = (countMap[i.subject_id] || 0) + 1;
    });

    let topCourseId: number | null = null;
    let max = 0;

    for (const id in countMap) {
        if (countMap[id] > max) {
            max = countMap[id];
            topCourseId = Number(id);
        }
    }

    const topCourse = subjects.find(s => s.id === topCourseId);

    // ===== RENDER =====
    setText("total-estudiantes", totalStudents);
    setText("total-cursos", totalSubjects);
    setText("total-inscripciones", totalInscriptions);
    setText("estudiantes-activos", activeStudents);
    setText("cursos-cerrados", closedSubjects);
    setText("curso-top", topCourse ? topCourse.name : "Ninguno");
}

// helper limpio ✨
function setText(id: string, value: string | number) {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value);
}