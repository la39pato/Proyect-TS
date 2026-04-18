import type { Subject } from '../models/Subjects.js';
import { saveSubjects, loadSubjects } from '../utils/storage.js';
export class SubjectService{
    private index: number = 0;
    private subjects: Subject[] = [];

    async addSubject(name: string,code: string, teacher: string, MaxStudents: number, ActualStudents: number ): Promise<void> {
        this.subjects = await loadSubjects();

        const newId = this.subjects.length > 0
        ? Math.max(...this.subjects.map(s => s.id)) + 1
        : 1;
        const subject: Subject = { id: newId, name, code, teacher, MaxStudents, ActualStudents, State: "available" };

        this.subjects.push(subject);
        await saveSubjects(this.subjects);
    }

    async getSubjects(): Promise<Subject[]> {
        this.subjects = await loadSubjects();
        return this.subjects;
    }

    async updateSubject(updatedSubject: Subject): Promise<void> {
        this.subjects = await loadSubjects();
        const index = this.subjects.findIndex(subject => subject.id === updatedSubject.id);
        if (index !== -1) {
            this.subjects[index] = updatedSubject;
            saveSubjects(this.subjects);
        }
    }

    async deleteSubject(subjectId: number): Promise<void> {
        this.subjects = await loadSubjects();
        this.subjects = this.subjects.filter(subject => subject.id !== subjectId);
        saveSubjects(this.subjects);
    }

    async changeSubjectState(subjectId: number, newState: Subject['State']): Promise<void> {
        this.subjects = await loadSubjects();
        const index = this.subjects.findIndex(subject => subject.id === subjectId);
        if (index !== -1) {
            this.subjects[index].State = newState;
            saveSubjects(this.subjects);
        }
    }
    
    async ShowSubjectByName(subjectname: string): Promise<Subject> {
        this.subjects = await loadSubjects();
        return this.subjects.find(subject => subject.name === subjectname) as Subject;
    }

    async ShowSubjectByCode(subjectcode: string): Promise<Subject> {
        this.subjects = await loadSubjects();
        return this.subjects.find(subject => subject.code === subjectcode) as Subject;
    }

    async ShowSubjectsAvailable(): Promise<Subject[]> {
        this.subjects = await loadSubjects();
        return this.subjects.filter(subject => subject.State === "available");
    }

    async ShowSubjectsClosed(): Promise<Subject[]> {
        this.subjects = await loadSubjects();
        return this.subjects.filter(subject => subject.State === "closed");
    }

    async TotalClosedSubjects(): Promise<number> {
        this.subjects = await loadSubjects();
        return this.subjects.filter(subject => subject.State === "closed").length;
    }
}