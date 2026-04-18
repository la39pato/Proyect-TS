import type { Inscription } from '../models/Inscriptions.js';
import { saveInscriptions, loadInscriptions, loadStudents, loadSubjects } from '../utils/storage.js';
export class InscriptionService{
    private inscriptions: Inscription[] = [];

    async addInscription(studentid: number, subjectid: number): Promise<void> {
        this.inscriptions = await loadInscriptions();
        const newId = this.inscriptions.length > 0
        ? Math.max(...this.inscriptions.map(i => i.id)) + 1
        : 1;
        const inscription: Inscription = { id: newId, student_id: studentid, subject_id: subjectid, date: new Date(), status: 'pending' };
        this.inscriptions.push(inscription);
        saveInscriptions(this.inscriptions);
    }

    async getInscriptions(): Promise<Inscription[]> {
        this.inscriptions = await loadInscriptions();

        // 🔥 CONVERTIR STRING → DATE
        this.inscriptions = this.inscriptions.map(i => ({
            ...i,
            date: new Date(i.date)
        }));

        return this.inscriptions;
    }
    async updateInscription(updatedInscription: Inscription): Promise<void> {
        this.inscriptions = await loadInscriptions();
        const index = this.inscriptions.findIndex(inscription => inscription.id === updatedInscription.id);
        if (index !== -1) {
            this.inscriptions[index] = updatedInscription;
            saveInscriptions(this.inscriptions);
        }
    }

    async changeInscriptionStatus(inscriptionId: number, newStatus: 'pending' | 'approved' | 'rejected'): Promise<void> {
        this.inscriptions = await loadInscriptions();
        const index = this.inscriptions.findIndex(inscription => inscription.id === inscriptionId);
        if (index !== -1 && this.inscriptions[index]) {
            this.inscriptions[index].status = newStatus;
            saveInscriptions(this.inscriptions);
        }
    }

    async ShowStudentSubjects(studentId: number): Promise<{ subjectName: string; status: Inscription['status'] }[]> {
        this.inscriptions = await loadInscriptions();
        const subjects = await loadSubjects();
        const studentInscriptions = this.inscriptions.filter(inscription => inscription.student_id === studentId);
        return studentInscriptions.map(inscription => {
            const subject = subjects.find(subject => subject.id === inscription.subject_id);
            return { subjectName: subject ? subject.name : 'Unknown Subject', status: inscription.status };
        });
    }

    async ShowSubjectStudents(subjectId: number): Promise<{ studentName: string; status: Inscription['status'] }[]> {
        this.inscriptions = await loadInscriptions();
        const students = await loadStudents();
        const subjectInscriptions = this.inscriptions.filter(inscription => inscription.subject_id === subjectId);
        return subjectInscriptions.map(inscription => {
            const student = students.find(student => student.id === inscription.student_id);
            return { studentName: student ? student.name : 'Unknown Student', status: inscription.status };
        });
    }
}
