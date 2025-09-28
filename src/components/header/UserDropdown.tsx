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

  if (!user) return null;

  const displayName = user.name ? user.name : user.email.split("@")[0];
  const role = user.role ? user.role : "User"; // fallback role

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  return (
    <div className="relative " ref={dropdownRef}>
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
  <span className="mr-2 text-base font-medium text-white">{displayName}</span>

  {/* Dropdown Arrow */}
  <svg
    className={`stroke-white transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
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
          className="absolute right-0 mt-[17px] flex w-[280px] flex-col rounded-2xl p-4 shadow-lg "
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            border: "1px solid rgba(164, 167, 174, 1)", 
            backdropFilter: "blur(100px)",
            WebkitBackdropFilter: "blur(100px)",
          }}
        >
          {/* User Info */}
          <div className="mb-3">
            <span className="block text-base font-semibold text-white">
              {displayName}
            </span>
            <span className="block text-sm text-gray-300">{user.email}</span>
          </div>

          {/* Role + Active Badge Row */}
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 text-xs font-medium rounded-md bg-white/10 text-white">
              {role}
            </span>
            <span
              className="px-3 py-1 text-xs font-medium rounded-md"
              style={{
                backgroundColor: "rgba(50, 213, 131, 0.4)",
                color: "#fff",
              }}
            >
              Active
            </span>
          </div>

          {/* Profile Option - open modal instead of redirect */}
          <button
            onClick={() => {
              setIsOpen(false);
              setIsProfileOpen(true);
            }}
            className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 transition"
          >
            <Image
              src="/images/profile.svg"
              alt="Profile"
              width={22}
              height={22}
            />
            Profile
          </button>

          {/* Theme Option */}
          <button
            onClick={() => {
              setIsOpen(false);
              console.log("Theme toggle clicked");
            }}
            className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 transition"
          >
            <Image src="/images/theme.svg" alt="Theme" width={22} height={22} />
            Theme
          </button>
      {/* Support Option - opens in-place modal instead of navigating */}
          <button
            onClick={() => {
              setIsOpen(false);
              setIsSupportOpen(true);
            }}
            className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 transition"
          >
            <Image
              src="/images/support.svg"
              alt="Support"
              width={22}
              height={22}
            />
            Support
          </button>

          {/* Divider */}
          <hr className="my-3 border-white/20" />

          {/* Logout Option */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition"
            style={{
              color: "rgba(240, 68, 56, 0.9)", // darker red text
            }}
            disabled={isLoggingOut}
          >
            <Image
              src="/images/logout.svg"
              alt="Logout"
              width={22}
              height={22}
            />
            {isLoggingOut ? "Signing out..." : "Logout"}
          </button>
        </div>
      )}
      {/* Modals live outside the dropdown so they can open independently */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        user={{ name: user.name, email: user.email, image: (user as any).image }}
        onSubmit={async (data) => {
          // TODO: wire to backend/email service
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
