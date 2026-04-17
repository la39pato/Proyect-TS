export interface Inscription {
    id: number;
    student_id: number;
    subject_id: number;
    date: Date;
    status: InscriptionStatus;
}

type InscriptionStatus = 'pending' | 'approved' | 'rejected'; //reject = cancel
