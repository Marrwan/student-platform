"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Bell, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) loadNotifications();
  }, [open]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch (err) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  return (
    <div className="relative inline-block text-left">
      <Button variant="ghost" className="relative p-2" onClick={() => setOpen((v) => !v)}>
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5">
            {unreadCount}
          </span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-96 z-50">
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="font-semibold text-lg">Notifications</span>
              <Button variant="outline" size="sm" onClick={loadNotifications} disabled={loading}>
                Refresh
              </Button>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y">
              {notifications.length === 0 && (
                <div className="p-4 text-center text-gray-500">No notifications</div>
              )}
              {notifications.map((n) => (
                <div key={n.id} className={`flex items-start gap-3 p-4 ${!n.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                  <div className="flex-shrink-0 mt-1">
                    <Badge variant={n.isRead ? "outline" : "default"}>
                      {n.type}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{n.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{n.content}</div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {!n.isRead && (
                      <Button size="icon" variant="ghost" onClick={() => markAsRead(n.id)} title="Mark as read">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => deleteNotification(n.id)} title="Delete">
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
} 