"use client";

import { useClerk, UserAvatar } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ClerkUserMenuProps = {
  triggerClassName?: string;
  menuClassName?: string;
  signOutClassName?: string;
};

export default function ClerkUserMenu({
  triggerClassName,
  menuClassName,
  signOutClassName,
}: ClerkUserMenuProps) {
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut({ redirectUrl: "/" });
  };

  return (
    <div className="relative mix-blend-normal" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={
          triggerClassName ??
          "rounded-full overflow-hidden ring-2 ring-white/20 hover:ring-white/40 transition-all"
        }
        aria-label="User menu"
        aria-expanded={open}
      >
        <UserAvatar />
      </button>
      {open ? (
        <div
          className={
            menuClassName ??
            "absolute right-0 mt-2 min-w-[9rem] rounded-xl border border-white/10 bg-[#14141c] shadow-xl py-1 z-50"
          }
        >
          <button
            type="button"
            onClick={handleSignOut}
            className={
              signOutClassName ??
              "flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[#E2E4E9] hover:bg-white/5 transition-colors"
            }
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
