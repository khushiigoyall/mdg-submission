import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
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
    <div className="relative flex items-center">
      
      <button
        onClick={() => setOpen(!open)}
        className="relative !text-[#7a7570] hover:!text-[#c9a96e] transition-colors p-1"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-[#c9a96e] text-[#111010] text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-[#0e0d0c] translate-x-1/4 -translate-y-1/4">
            {unreadCount}
          </span>
        )}
      </button>

      
      {open && (
        <div className="absolute right-0 top-[120%] mt-2 w-80 bg-[#1a1917] border border-white/[0.07] text-[#e8e3dc] rounded-md shadow-2xl z-50 overflow-hidden">
          {notifications.length === 0 && (
            <div className="p-4 text-[#7a7570] text-sm text-center">No notifications</div>
          )}

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleRead(n.id)}
                className={`p-4 border-b border-white/[0.05] cursor-pointer hover:bg-[#232220] transition-colors ${
                  n.is_read ? "opacity-60" : "bg-white/[0.02]"
                }`}
              >
                <div className="font-semibold text-[14px] text-[#e8e3dc]">{n.actor_name}</div>
                <div className="text-sm text-[#7a7570] mt-1">{n.message}</div>
                <div className="text-[11px] text-[#c9a96e] mt-2">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={loadMore}
              className="w-full p-3 text-sm text-[#c9a96e] hover:text-[#e8e3dc] hover:bg-[#232220] transition-colors font-medium border-t border-white/[0.05]"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
}
