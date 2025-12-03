import { Notification, NotificationCount } from "@/types/notification";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:10001";

export async function getAllNotifications(): Promise<Notification[]> {
  try {
    const res = await fetch(`${API}/api/notifications`, {
      credentials: 'include'
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getUnreadNotifications(): Promise<Notification[]> {
  try {
    const res = await fetch(`${API}/api/notifications/unread`, {
      credentials: 'include'
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getUnreadCount(): Promise<number> {
  try {
    const res = await fetch(`${API}/api/notifications/unread/count`, {
      credentials: 'include'
    });
    if (!res.ok) return 0;
    const data: NotificationCount = await res.json();
    return data.count;
  } catch {
    return 0;
  }
}

export async function markAsRead(notificationId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API}/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
      credentials: 'include'
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function markAllAsRead(): Promise<boolean> {
  try {
    const res = await fetch(`${API}/api/notifications/read-all`, {
      method: 'PATCH',
      credentials: 'include'
    });
    return res.ok;
  } catch {
    return false;
  }
}

