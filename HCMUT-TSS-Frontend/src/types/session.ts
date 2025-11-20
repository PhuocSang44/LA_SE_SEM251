export interface Session {
  id: number;
  classId: number; // parent class
  title: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  tutorId: number;
  tutorName?: string;
  status: 'scheduled' | 'cancelled' | 'completed';
}

export interface CreateSessionPayload {
  classId: number;
  title: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  location?: string;
  sessionType?: string;
  capacity?: number;
  description?: string;
}

export interface UpdateSessionPayload {
  title?: string;
  startTime?: string;
  endTime?: string;
  status?: 'scheduled' | 'cancelled' | 'completed';
}
