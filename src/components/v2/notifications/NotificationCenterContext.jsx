// ================================================================
// NotificationCenterContext — single source of truth for the
// V2 notification center. Holds:
//   - cached unread count + recent list
//   - SSE stream subscription (one per app session)
//   - mutation helpers (markRead / bulkRead / archive)
//   - real-time toast queue (max 3, FIFO)
//
// Mounted once at /v2/dashboard layout level (or higher).
// ================================================================
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  listNotifications, getUnreadCount, markRead as apiMarkRead,
  bulkRead as apiBulkRead, archive as apiArchive
} from '@/api/v2/notifications';
import { useNotificationStream } from '@/hooks/v2/useNotificationStream';

const NotificationCenterContext = createContext(null);

const TOAST_MAX = 3;
const TOAST_DURATION_MS = 8000;

export function NotificationCenterProvider({ children, enabled = true }) {
  const [unread, setUnread]         = useState(0);
  const [recent, setRecent]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [toasts, setToasts]         = useState([]);

  const refreshUnread = useCallback(async () => {
    try { setUnread(await getUnreadCount()); }
    catch (err) { /* ignore — not fatal */ }
  }, []);

  const refreshList = useCallback(async () => {
    setLoading(true);
    try { setRecent(await listNotifications({ limit: 30 })); }
    catch (err) { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const pushToast = useCallback((notification) => {
    setToasts((t) => [...t.slice(-(TOAST_MAX - 1)), notification]);
    // Auto-dismiss.
    setTimeout(() => dismissToast(notification.id), TOAST_DURATION_MS);
  }, [dismissToast]);

  const handleStreamEvent = useCallback((eventName, payload) => {
    if (eventName !== 'notification' || !payload?.id) return;
    setUnread((n) => n + 1);
    setRecent((r) => [payload, ...r.filter((x) => x.id !== payload.id)].slice(0, 50));
    pushToast(payload);
  }, [pushToast]);

  const { connected } = useNotificationStream(handleStreamEvent, { enabled });

  // Initial load.
  useEffect(() => {
    if (!enabled) return undefined;
    refreshUnread();
    refreshList();
  }, [enabled, refreshUnread, refreshList]);

  // Mutations — also update local cache optimistically.
  const markRead = useCallback(async (id) => {
    setRecent((r) => r.map((n) => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n));
    setUnread((u) => Math.max(0, u - 1));
    try { await apiMarkRead(id); } catch { /* swallow — UI already updated */ }
  }, []);

  const bulkRead = useCallback(async () => {
    setRecent((r) => r.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
    try { await apiBulkRead(); } catch { /* swallow */ }
  }, []);

  const archive = useCallback(async (id) => {
    setRecent((r) => r.filter((n) => n.id !== id));
    try { await apiArchive(id); } catch { /* swallow */ }
  }, []);

  const value = {
    unread,
    recent,
    loading,
    connected,
    toasts,
    refreshUnread,
    refreshList,
    markRead,
    bulkRead,
    archive,
    dismissToast
  };

  return <NotificationCenterContext.Provider value={value}>{children}</NotificationCenterContext.Provider>;
}

export function useNotificationCenter() {
  const ctx = useContext(NotificationCenterContext);
  if (!ctx) throw new Error('useNotificationCenter must be used within NotificationCenterProvider');
  return ctx;
}
