export interface Subject{ 
    id: number; 
    name: string; 
    code: string; 
    teacher: string; 
    MaxStudents: number; 
    ActualStudents: number; 
    State: SubjectState 
}

type SubjectState = "available" | "closed";
