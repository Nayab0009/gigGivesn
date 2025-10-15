"use client";
import React, { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { getNotifications } from "@/lib/notifications";
import { useAuth } from "@/context/AuthContext";

type NotificationDropdownProps = {
  trigger?: React.ReactNode;
};

export default function NotificationDropdown({ trigger }: NotificationDropdownProps) {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  function toggleDropdown() {
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
    setNotifying(false);
  };

  // Format notification text by removing timestamps
  const formatNotificationText = (text: string) => {
    return text.replace(/\w{3} \w{3} \d{2} \d{4} \d{2}:\d{2}:\d{2} GMT[+\-]\d{4} \([^)]+\)/g, (match) => {
      const date = new Date(match);
      return date.toLocaleDateString();
    });
  };

  // Format relative time (e.g., "2 hours ago")
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString();
  };

  // Fetch notifications when dropdown is opened
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      if (!token) {
        console.log("No token available in AuthContext");
        return;
      }
      console.log("Using token from AuthContext");
      const data = await getNotifications(token);
      console.log("Notifications data:", data);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <div className="relative">
      {trigger ? (
        <span onClick={handleClick} className="relative cursor-pointer">
          {trigger}
          <span
            className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
              !notifying ? "hidden" : "flex"
            }`}
          >
            <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
          </span>
        </span>
      ) : (
        <button
          className="relative dropdown-toggle flex items-center justify-center text-text-secondary transition-colors border border-gray-200 rounded-full hover:text-text-main h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
          onClick={handleClick}
        >
          <span
            className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
              !notifying ? "hidden" : "flex"
            }`}
          >
            <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
          </span>
          <svg
            className="fill-current"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
              fill="currentColor"
            />
          </svg>
        </button>
      )}

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="dropdown-bg-dark absolute right-0 mt-3 flex h-auto w-[370px] flex-col rounded-2xl border border-white/10 p-4 shadow-2xl z-50 [background:var(--container-bg)]"
      >
        {/* Header with filters */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-full text-sm font-semibold shadow border border-white/10 text-text-main">
              All
            </button>
            <button className="px-3 py-1 rounded-full text-sm border border-white/10 text-text-secondary">
              Unread
            </button>
          </div>
          <button className="px-3 py-1 text-sm font-medium text-text-main bg-blue-500/80 rounded-full hover:bg-blue-600/90 shadow border border-white/10">
            Read All
          </button>
        </div>

        {/* Notification items */}
        <ul className="flex flex-col gap-4">
          {loading ? (
            <li className="text-center text-text-secondary">Loading notifications...</li>
          ) : notifications.length === 0 ? (
            <li className="text-center text-text-secondary">No notifications found.</li>
          ) : (
            notifications.map((n, idx) => (
              <li
                key={n.id || idx}
                className={`border-b border-white/5 pb-4 last:border-0 flex flex-col gap-1 p-3 rounded-lg transition-all ${
                  !n.seen ? "bg-white/5" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {!n.seen && (
                      <span
                        className="inline-block w-2 h-2 rounded-full bg-orange-400 animate-pulse"
                        title="Unseen"
                      ></span>
                    )}
                    <span className="text-xs font-medium text-text-main">
                      {n.id ? `#${n.id}` : ""}
                    </span>
                  </div>
                  <span className="text-xs text-text-secondary">
                    {getRelativeTime(n.createdAt)}
                  </span>
                </div>

                <p className="text-sm mt-1 leading-relaxed text-text-secondary">
                  {formatNotificationText(n.text)}
                </p>

                {n.link && n.link !== "" && (
                  <div className="mt-2">
                    <a
                      href={n.link}
                      className="px-3 py-1 text-xs bg-blue-500/20 text-text-main rounded-full hover:bg-blue-500/30 transition-colors inline-flex items-center gap-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      View
                    </a>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </Dropdown>
    </div>
  );
}
