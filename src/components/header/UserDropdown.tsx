"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { colors } from "@/colors";

export default function UserDropdown() {
  const { user, signout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    setIsOpen(false);
    await signout();
    router.push("/signin");
  };

  if (!user) return null;

  const displayName = user.name ? user.name : user.email.split("@")[0];

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);

  const getAvatarColor = () => ({
    background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
  });

  return (
    <div className="relative">
      {/* Toggle button with avatar + name */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="flex items-center text-white"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11 flex items-center justify-center text-white font-semibold text-lg">
          <div
            className="w-full h-full rounded-full flex items-center justify-center"
            style={getAvatarColor()}
          >
            {getInitials(displayName)}
          </div>
        </span>
        <span className="block mr-1 font-medium text-theme-sm text-white">
          {displayName}
        </span>

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
        <div className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl bg-black/40 backdrop-blur-md p-4 shadow-lg">
          {/* Only Email */}
          <span className="block text-sm text-white">{user.email}</span>

          {/* Sign out button */}
          {/* Sign out button */}
<button
  onClick={handleSignOut}
  className="mt-4 flex items-center justify-center gap-2 px-3 py-2 font-medium text-white rounded-lg text-sm transition-colors"
  style={{
    backgroundColor: colors.primary.hex,
  }}
  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.accent.hex)}
  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.primary.hex)}
  disabled={isLoggingOut}
>
  {isLoggingOut ? "Signing out..." : "Sign out"}
</button>

        </div>
      )}
    </div>
  );
}
