"use client";
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { colors } from "@/colors";
import Image from "next/image";
import UserProfile from "../generic/UserProfile";
import SupportModal from "@/components/generic/SupportModal";

export default function UserDropdown() {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, signout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    setIsOpen(false);
    await signout();
    router.push("/signin");
  };

  // fallback values if user is null
  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "Guest";
  const role = user?.role ?? "User";

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);

  const getAvatarColor = () => ({
    background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
  });

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // show minimal UI when not signed in
  if (!user) {
    return (
      <div className="text-gray-400 text-sm italic">
        Not signed in
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle button with avatar + name */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="flex items-center text-white"
      >
        {/* Avatar */}
        {user.avatar ? (
          <div className="mr-3 h-11 w-11 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={user.avatar}
              alt={displayName}
              width={44}
              height={44}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className="mr-3 h-11 w-11 flex items-center justify-center rounded-full text-white font-semibold text-lg"
            style={getAvatarColor()}
          >
            {getInitials(displayName)}
          </div>
        )}

        {/* Name */}
        <span className="mr-2 text-base font-medium text-white">
          {displayName}
        </span>

        {/* Dropdown Arrow */}
        <svg
          className={`stroke-white transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute bg-black/30 right-0 backdrop-blur-[100px] mt-[17px] flex w-[280px] flex-col rounded-2xl p-[1.375rem] shadow-lg "
          style={{
            border: "0.5px solid #A4A7AE",
          }}
        >
          {/* User Info */}
          <div className="flex justify-between items-center">
          <div className="mb-3">
            <span className="block text-xs font-semibold text-white">
              {displayName}
            </span>
            <span className="block text-sm text-gray-400">{user.email}</span>
          </div>

          {/* Role + Active Badge Row */}
          <div className="flex items-center mb-4 gap-1">
            <span className="px-3 py-0.5  font-bold text-[10px] rounded-[50px] bg-white/10 text-white">
              {role}
            </span>
            <span
              className="px-3 py-0.5 text-[10px] font-bold rounded-[50px]"
              style={{
                backgroundColor: "rgba(50, 213, 131, 0.4)",
                color: "#fff",
              }}
            >
              Active
            </span>
          </div>
          </div>

          {/* Profile Option */}
          <button
            onClick={() => {
              setIsOpen(false);
              setIsProfileOpen(true);
            }}
            className="flex items-center hover:px-3 gap-3 w-full text-left  py-2 rounded-lg text-xs text-white hover:bg-white/10 transition"
          >
            <Image
              src="/images/profile.svg"
              alt="Profile"
              width={16}
              height={16}
            />
            Profile
          </button>

          {/* Theme Option */}
          <button
            onClick={() => {
              setIsOpen(false);
              console.log("Theme toggle clicked");
            }}
            className="flex items-center hover:px-3 gap-3 w-full text-left  py-2 rounded-lg text-xs text-white hover:bg-white/10 transition"
          >
            <Image src="/images/theme.svg" alt="Theme" width={16} height={16} />
            Theme
          </button>

          {/* Support Option */}
          <button
            onClick={() => {
              setIsOpen(false);
              setIsSupportOpen(true);
            }}
            className="flex items-center hover:px-3 gap-3 w-full text-left  py-2 rounded-lg text-xs text-white hover:bg-black/10 transition"
          >
            <Image
              src="/images/support.svg"
              alt="Support"
              width={16}
              height={16}
            />
            Support
          </button>

          {/* Logout Option */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 hover:px-3 w-full text-left  py-2 rounded-lg text-xs font-medium transition"
            style={{
              color: "rgba(240, 68, 56, 0.9)", // darker red text
            }}
            disabled={isLoggingOut}
          >
            <Image
              src="/images/logout.svg"
              alt="Logout"
              width={16}
              height={16}
            />
            {isLoggingOut ? "Signing out..." : "Logout"}
          </button>
        </div>
      )}

      {/* Modals */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        user={{
          name: user.name ?? displayName,
          email: user.email ?? "",
          image: (user as any)?.image ?? "",
        }}
        onSubmit={async (data) => {
          console.log("Support request:", data);
        }}
      />
      <UserProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}
