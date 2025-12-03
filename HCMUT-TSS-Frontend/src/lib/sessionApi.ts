import { Session, CreateSessionPayload, UpdateSessionPayload, EnrollMentSessionRequest } from "@/types/session";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:10001";

async function safeJson(res: Response) {
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; } catch { return text; }
}

export async function listSessionsByClass(classId: number): Promise<Session[]> {
  try {
    const res = await fetch(`${API}/api/sessions/${classId}`, { credentials: 'include' });
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

export async function listSessionsByUser(): Promise<Session[]> {
  try {
    // backend exposes /api/sessions/userId for the authenticated user
    const res = await fetch(`${API}/api/sessions/userId`, { credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json();
    // Normalize server SessionResponse -> frontend Session
    return Array.isArray(data) ? data.map((s: any) => ({
      // keep both id and sessionId to avoid breaking places that use either
      id: Number(s.sessionId ?? s.id ?? 0),
      sessionId: Number(s.sessionId ?? s.id ?? 0),
      classId: Number(s.classId ?? s.classId ?? 0),
      title: s.sessionTitle ?? s.title ?? s.sessionTitle ?? '',
      sessionTitle: s.sessionTitle ?? s.title ?? '',
      startTime: s.startTime ?? s.start_time ?? '',
      endTime: s.endTime ?? s.end_time ?? '',
      tutorId: s.tutorId ?? s.tutorId ?? null,
      tutorName: s.tutorName ?? s.tutorName ?? '',
      status: (s.status || '').toLowerCase() as ('scheduled' | 'cancelled' | 'completed')
    })) : [];
  } catch (e) {
    console.error('listSessionsByUser error', e);
    return [];
  }
}

export async function listAllSessions(userId: number | null): Promise<Session[]> {
  try {
    const res = await fetch(`${API}/api/sessions/${userId}`, {method: 'GET', credentials: 'include' });
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

export async function createSession(payload: CreateSessionPayload): Promise<Session | null> {
  try {
    const res = await fetch(`${API}/api/sessions`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text() || 'Create session failed');
    const data =  await safeJson(res);
    if (!data) return {} as Session;
    return (data.ok ?? data) as Session;
  } catch (e) {
    console.error(e);
    return null;
  }
}


export async function cancelEnroll(sessionId: number, userId?: number): Promise<boolean> {
  try {
    // If you have an auth/context provider, read current user id here when userId is not passed:
    // const currentUserId = authContext?.user?.id;
    if (userId == null) {
      console.error('cancelEnroll requires a userId (or provide a current user fallback).');
      return false;
    }

    console.log('cancelEnroll called with', sessionId, userId);
    const res = await fetch(`${API}/api/sessions/unenroll`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, userId })
    });
    return res.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function updateSession(id: number, payload: UpdateSessionPayload): Promise<boolean> {
  try {
    const res = await fetch(`${API}/api/sessions/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (e) { console.error(e); return false; }
}

export async function deleteSession(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API}/api/sessions/${id}`, { method: 'DELETE', credentials: 'include' });
    return res.ok;
  } catch (e) { console.error(e); return false; }
}

export function hasConflict(existing: Session[], candidate: Session): boolean {
  const cStart = new Date(candidate.startTime).getTime();
  const cEnd = new Date(candidate.endTime).getTime();
  return existing.some(s => {
    if (s.status === 'cancelled') return false;
    const sStart = new Date(s.startTime).getTime();
    const sEnd = new Date(s.endTime).getTime();
    return cStart < sEnd && sStart < cEnd; // overlap
  });
}

export function formatSessionRange(session: Session): string {
  const start = new Date(session.startTime);
  const end = new Date(session.endTime);
  const datePart = start.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
  const startTime = start.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' });
  const endTime = end.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' });
  return `${datePart} ${startTime} - ${endTime}`;
}

export async function enrollInSession(payload: EnrollMentSessionRequest): Promise<boolean> {
  try {
    const res = await fetch(`${API}/api/sessions/enroll`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (e) { console.error(e); return false; }
}
