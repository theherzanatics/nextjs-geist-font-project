export interface University {
  id: string;
  name: string;
  location: string;
  type: 'public' | 'private';
  logo?: string;
  website?: string;
  photoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  admissionOffice?: string;
  ranking?: {
    national?: number;
    international?: number;
  };
}

export interface Program {
  id: string;
  name: string;
  universityId: string;
  requirements: string[];
  deadline: Date;
  applicationFee: number;
  earlyDeadline?: Date;
  programType: 'undergraduate' | 'graduate' | 'phd';
  duration: string;
  description?: string;
  acceptanceRate?: number;
  averageSAT?: number;
  averageACT?: number;
}

export type ApplicationStatus = 'pending' | 'submitted' | 'under-review' | 'accepted' | 'rejected' | 'waitlisted' | 'dpwas' | 'waitlist';

export interface Document {
  id: string;
  name: string;
  type: 'transcript' | 'recommendation' | 'essay' | 'test-score' | 'portfolio' | 'certificate' | 'other';
  status: 'pending' | 'uploaded' | 'submitted' | 'verified' | 'expired';
  fileUrl?: string;
  fileName?: string;
  uploadDate?: Date;
  expirationDate?: Date;
  notes?: string;
}

export interface Interview {
  id: string;
  type: 'online' | 'in-person' | 'phone';
  scheduledDate: Date;
  duration: number;
  interviewer?: string;
  location?: string;
  meetingLink?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  feedback?: string;
  rating?: number;
}

export interface FinancialAid {
  id: string;
  type: 'scholarship' | 'grant' | 'loan' | 'work-study';
  name: string;
  amount?: number;
  deadline?: Date;
  status: 'not-applied' | 'applied' | 'pending' | 'approved' | 'rejected';
  requirements: string[];
  documents: Document[];
}

export interface Application {
  id: string;
  university: University;
  program: Program;
  status: ApplicationStatus;
  submittedDate?: Date;
  notes?: string;
  documents: Document[];
  reminders: Reminder[];
  interviews: Interview[];
  financialAid: FinancialAid[];
  checklist: {
    [key: string]: {
      completed: boolean;
      completedDate?: Date;
      notes?: string;
    };
  };
  priority: 'regular' | 'early' | 'priority' | 'rolling';
  applicationFeePaid: boolean;
  applicationFeeAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  type: 'deadline' | 'document' | 'interview' | 'result' | 'financial-aid';
  date: Date;
  message: string;
  isCompleted: boolean;
  relatedId?: string;
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

export interface AnalyticsData {
  successRate: number;
  averageProcessingTime: number;
  mostAppliedUniversities: Array<{ university: string; count: number }>;
  statusDistribution: Record<ApplicationStatus, number>;
  deadlineProximity: {
    urgent: number;
    soon: number;
    later: number;
  };
}
