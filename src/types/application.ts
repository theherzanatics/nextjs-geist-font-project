export interface University {
  id: string;
  name: string;
  location: string;
  type: 'public' | 'private';
  logo?: string;
  website?: string;
  photoUrl?: string;
}

export interface Program {
  id: string;
  name: string;
  universityId: string;
  requirements: string[];
  deadline: Date;
  applicationFee: number;
}

export type ApplicationStatus = 'pending' | 'submitted' | 'under-review' | 'accepted' | 'rejected' | 'waitlisted' | 'dpwas' | 'waitlist';

export interface Application {
  id: string;
  university: University;
  program: Program;
  status: ApplicationStatus;
  submittedDate?: Date;
  notes?: string;
  documents: string[];
  reminders: Reminder[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  type: 'deadline' | 'document' | 'interview' | 'result';
  date: Date;
  message: string;
  isCompleted: boolean;
}

export interface ApplicationStats {
  total: number;
  pending: number;
  submitted: number;
  'under-review': number;
  accepted: number;
  rejected: number;
  waitlisted: number;
  dpwas: number;
  waitlist: number;
}
