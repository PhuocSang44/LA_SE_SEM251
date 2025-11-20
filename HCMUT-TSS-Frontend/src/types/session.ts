export interface Session {
  id: number;
  classId: number; // parent class
  topic: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  tutorId: number;
  tutorName?: string;
  status: 'scheduled' | 'cancelled' | 'completed';
}

export interface CreateSessionPayload {
  classId: number;
  topic: string;
  startTime: string; // ISO
  endTime: string;   // ISO
}

export interface UpdateSessionPayload {
  topic?: string;
  startTime?: string;
  endTime?: string;
  status?: 'scheduled' | 'cancelled' | 'completed';
}
