import { useEffect, useState } from "react";
import {
  getNotifications,
  markNotificationRead,
} from "../services/notificationService";
import { useNotificationSocket } from "../utils/useNotificationsocket";

interface Notification {
  id: number;
  message: string;
  actor_name: string;
  is_read: boolean;
  created_at: string;
  photo_id?: number;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchNotifications = async (p: number) => {
    try {
      const data = await getNotifications(p);
      const results = data.results || data;
      if (p === 1) {
        setNotifications(results);
      } else {
        setNotifications((prev) => {
          const combined = [...prev, ...results];
          const uniqueMap = new Map(combined.map(item => [item.id, item]));
          return Array.from(uniqueMap.values()).sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
      }
      setHasMore(data.next !== null && data.next !== undefined);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  useNotificationSocket((data) => {
    setNotifications((prev) => [data, ...prev]);
  });

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleRead = async (id: number) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  return (
    <div className="relative">
      
      <button
        onClick={() => setOpen(!open)}
        className="relative text-xl"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-xs px-1 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      
      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-slate-900 text-white rounded shadow-xl z-50">
          {notifications.length === 0 && (
            <div className="p-3 text-gray-400">No notifications</div>
          )}

          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleRead(n.id)}
              className={`p-3 border-b border-slate-700 cursor-pointer ${
                n.is_read ? "opacity-60" : "bg-slate-800"
              }`}
            >
              <div className="font-semibold">{n.actor_name}</div>
              <div className="text-sm">{n.message}</div>
              <div className="text-xs text-gray-400">
                {new Date(n.created_at).toLocaleString()}
              </div>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              className="w-full p-3 text-sm text-blue-400 hover:text-blue-300 hover:bg-slate-800 border-t border-slate-700 transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
}
