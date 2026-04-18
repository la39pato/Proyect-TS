import type { Student } from '../models/Students.js';
import { saveStudents, loadStudents } from '../utils/storage.js';
export class StudentService{
    private index: number = 0;
    private students: Student[] = [];

    async addStudent(name: string, email: string, years: number, career: string, state: "active" | "inactive"): Promise<void> {
        this.students = await loadStudents();

        const newId = this.students.length > 0
        ? Math.max(...this.students.map(s => s.id)) + 1
        : 1;
        const student: Student = { id: newId, name, email, years, career, state };

        this.students.push(student);
        await saveStudents(this.students);
    }

    async getStudents(): Promise<Student[]> {
        this.students = await loadStudents();
        return this.students;
    }

    async updateStudent(updatedStudent: Student): Promise<void> {
        this.students = await loadStudents();
        const index = this.students.findIndex(student => student.id === updatedStudent.id);
        if (index !== -1) {
            this.students[index] = updatedStudent;
            saveStudents(this.students);
        }
    }

    async deleteStudent(studentId: number): Promise<void> {
        this.students = await loadStudents();
        this.students = this.students.filter(student => student.id !== studentId);
        saveStudents(this.students);
    }

    async changeStudentState(studentId: number, newState: Student['state']): Promise<void> {
        this.students = await loadStudents();
        const index = this.students.findIndex(student => student.id === studentId);
        if (index !== -1) {
            this.students[index].state = newState;
            saveStudents(this.students);
        }
    }

    async ShowStudentByName(studentname: string): Promise<Student> {
        this.students = await loadStudents();
        return this.students.find(student => student.name === studentname) as Student;
    }

    async ShowStudentsActive(): Promise<Student[]> {
        this.students = await loadStudents();
        return this.students.filter(student => student.state === "active");
    }

    async ShowStudentsInActive(): Promise<Student[]> {
        this.students = await loadStudents();
        return this.students.filter(student => student.state === "inactive");
    }

    async TotalActiveStudents(): Promise<number> {
        this.students = await loadStudents();
        return this.students.filter(student => student.state === "active").length;
    }
    
}