import  type { Student } from "../models/Students.js";
import  type { Subject } from "../models/Subjects.js";
import  type { Inscription } from "../models/Inscriptions.js";

async function saveStudents(students: Student[]): Promise<void> 
{
    localStorage.setItem('students', JSON.stringify(students));
}

async function saveSubjects(subjects: Subject[]): Promise<void> 
{
    localStorage.setItem('subjects', JSON.stringify(subjects));
}

async function saveInscriptions(inscriptions: Inscription[]): Promise<void> 
{
    localStorage.setItem('inscriptions', JSON.stringify(inscriptions));
}

async function loadStudents(): Promise<Student[]>
{
    const studentsData = localStorage.getItem('students');
    return studentsData ? JSON.parse(studentsData) : [];
}

async function loadSubjects(): Promise<Subject[]>
{
    const subjectsData = localStorage.getItem('subjects');
    return subjectsData ? JSON.parse(subjectsData) : [];
}

async function loadInscriptions(): Promise<Inscription[]>
{
    const inscriptionsData = localStorage.getItem('inscriptions');
    return inscriptionsData ? JSON.parse(inscriptionsData) : [];
}

async function TotalStudents(): Promise<number> {
    const students = await loadStudents();
    return students.length;
}

async function TotalSubjects(): Promise<number> {
    const subjects = await loadSubjects();
    return subjects.length;
}

async function TotalInscriptions(): Promise<number> {
    const inscriptions = await loadInscriptions();
    return inscriptions.length;
}

export  { saveStudents, saveSubjects, saveInscriptions, loadStudents, loadSubjects, loadInscriptions, TotalStudents, TotalSubjects, TotalInscriptions };