"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
  getHomeLocation,
  setHomeLocation as saveHomeLocation,
} from "@/lib/settings";

interface SettingsMenuProps {
  onHomeLocationChange?: () => void;
}

export default function SettingsMenu({
  onHomeLocationChange,
}: SettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const [homeLocation, setHomeLocationInput] = useState("");

  useEffect(() => {
    setHomeLocationInput(getHomeLocation() ?? "");
  }, [open]);

  function handleSaveHomeLocation() {
    if (homeLocation.trim()) {
      saveHomeLocation(homeLocation);
      onHomeLocationChange?.();
    }
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/60"
        aria-label="Settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.51 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.51-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.51 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9c.26.6.85 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-20 w-64 rounded-2xl bg-white p-4 shadow-lg">
          <label className="block text-xs font-medium text-slate-500">
            Home location
          </label>
          <input
            type="text"
            value={homeLocation}
            onChange={(event) => setHomeLocationInput(event.target.value)}
            placeholder="e.g. Hayward, CA"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#5B8DEF]"
          />
          <button
            type="button"
            onClick={handleSaveHomeLocation}
            className="mt-3 w-full rounded-xl bg-[#5B8DEF] px-3 py-2 text-sm font-medium text-white"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-2 w-full rounded-xl px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
