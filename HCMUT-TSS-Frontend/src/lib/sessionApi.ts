import { Session, CreateSessionPayload, UpdateSessionPayload } from "@/types/session";

const API = import.meta.env.VITE_API_BASE || "http://localhost:10001";

async function safeJson(res: Response) {
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; } catch { return text; }
}

export async function listSessionsByClass(classId: number): Promise<Session[]> {
  try {
    const res = await fetch(`${API}/api/classes/${classId}/sessions`, { credentials: 'include' });
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

export async function listAllSessions(): Promise<Session[]> {
  try {
    const res = await fetch(`${API}/api/sessions`, { credentials: 'include' });
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
    return await res.json();
  } catch (e) {
    console.error(e);
    return null;
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
