"use client";
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
    setNotifying(false);
  };

  // Example notifications (replace with API later)
  const notifications = [
    { code: "AER-001", message: "Adil khan changed the task status to completed", time: "2 minutes ago" },
    { code: "FAZ-034", message: "Asfand changed the task status to completed", time: "1 hour ago" },
    { code: "AER-019", message: "Task deadline is near", time: "3 hour ago" },
  ];

  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            !notifying ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        {/* Bell Icon */}
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

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-3 flex h-auto w-[370px] flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-[#0e1117] to-[#1a1f29] p-4 shadow-2xl backdrop-blur-xl z-50"
      >
        {/* Header with filters */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-full text-sm bg-white/10 text-white font-semibold shadow border border-white/10">All</button>
            <button className="px-3 py-1 rounded-full text-sm text-gray-300 hover:bg-white/10 border border-white/10">Unread</button>
          </div>
          <button className="px-3 py-1 text-sm font-medium text-white bg-blue-500/80 rounded-full hover:bg-blue-600/90 shadow border border-white/10">Read All</button>
        </div>

        {/* Notification items */}
        <ul className="flex flex-col gap-4">
          {notifications.map((n, idx) => (
            <li key={idx} className="border-b border-white/5 pb-3 last:border-0">
              <p className="font-semibold text-sky-400">{n.code}</p>
              <p className="text-gray-200 text-sm">{n.message}</p>
              <span className="text-xs text-gray-400">{n.time}</span>
            </li>
          ))}
        </ul>
      </Dropdown>
    </div>
  );
}
