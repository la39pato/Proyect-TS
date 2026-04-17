export interface Student{
    id: number;
    name: string;
    email: string;
    years: number;
    career: string;
    state: StudentState;
}

type StudentState = 'active' | 'inactive';
