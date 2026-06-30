"use client";

import { useState } from "react";
import {
  FiBell, FiCheck, FiDollarSign, FiUsers, FiMapPin,
  FiAlertCircle, FiTrendingUp, FiCheckCircle, FiTrash2,
} from "react-icons/fi";

type NotifType = "collection" | "system" | "user" | "alert" | "report";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "collection",
    title: "New Collection Recorded",
    message: "Collector Anwar Ibrahim added ₹5,000 from Kozhikode branch.",
    time: "2 minutes ago",
    read: false,
  },
  {
    id: "2",
    type: "user",
    title: "New Collector Added",
    message: "Fatima Al-Rashid has been registered as a collector in the Malappuram branch.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    type: "alert",
    title: "Branch Target Alert",
    message: "Thrissur branch has reached 90% of its monthly collection target.",
    time: "3 hours ago",
    read: false,
  },
  {
    id: "4",
    type: "report",
    title: "Monthly Report Ready",
    message: "The June 2026 collection report is ready for download.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "5",
    type: "system",
    title: "System Maintenance Complete",
    message: "Scheduled maintenance completed successfully. All services are running normally.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "6",
    type: "collection",
    title: "Large Collection Entry",
    message: "A collection of ₹25,000 was recorded from the Calicut branch. Verification pending.",
    time: "3 days ago",
    read: true,
  },
  {
    id: "7",
    type: "user",
    title: "Customer Registration Milestone",
    message: "Your organization has reached 500 registered customers.",
    time: "1 week ago",
    read: true,
  },
];

const TYPE_CONFIG: Record<NotifType, { icon: React.ElementType; bg: string; iconColor: string }> = {
  collection: { icon: FiDollarSign,   bg: "bg-[#e8f5ef]",  iconColor: "text-[#003527]" },
  system:     { icon: FiAlertCircle,  bg: "bg-blue-50",    iconColor: "text-blue-600" },
  user:       { icon: FiUsers,        bg: "bg-purple-50",  iconColor: "text-purple-600" },
  alert:      { icon: FiTrendingUp,   bg: "bg-amber-50",   iconColor: "text-amber-600" },
  report:     { icon: FiMapPin,       bg: "bg-slate-50",   iconColor: "text-slate-600" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayed = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const dismiss = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#003527] tracking-tight">
            Notifications
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex-shrink-0"
          >
            <FiCheckCircle className="text-[#003527]" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(["all", "unread"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
              filter === tab
                ? "bg-white text-[#003527] shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "all" ? "All" : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FiBell className="text-4xl mb-3 opacity-30" />
            <p className="text-sm font-medium">No unread notifications</p>
            <button
              onClick={() => setFilter("all")}
              className="mt-3 text-xs text-[#006c49] font-semibold hover:underline"
            >
              View all notifications
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {displayed.map((notif) => {
              const { icon: Icon, bg, iconColor } = TYPE_CONFIG[notif.type];
              return (
                <li
                  key={notif.id}
                  className={`flex items-start gap-4 px-5 py-4 hover:bg-slate-50/70 transition-colors group ${
                    !notif.read ? "bg-[#f0fdf8]" : ""
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className={`${iconColor} text-base`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold leading-tight ${!notif.read ? "text-[#003527]" : "text-slate-700"}`}>
                        {notif.title}
                        {!notif.read && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#006c49] ml-2 mb-0.5 align-middle" />
                        )}
                      </p>
                      <span className="text-xs text-slate-400 flex-shrink-0">{notif.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {!notif.read && (
                      <button
                        onClick={() => markRead(notif.id)}
                        title="Mark as read"
                        className="p-1.5 text-slate-400 hover:text-[#003527] hover:bg-[#e8f5ef] rounded-lg transition-colors"
                      >
                        <FiCheck className="text-sm" />
                      </button>
                    )}
                    <button
                      onClick={() => dismiss(notif.id)}
                      title="Dismiss"
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
