export interface Notification {
}
  count: number;
export interface NotificationCount {

}
  readAt?: string;
  createdAt: string;
  classId?: number;
  sessionId?: number;
  isRead: boolean;
  type: 'INFO' | 'SESSION_REMINDER' | 'CANCELLATION' | 'UPDATE' | 'SYSTEM';
  message: string;
  title: string;
  notificationId: number;

