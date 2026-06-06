"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

export default function ClerkUserSync() {
  const { user, isLoaded } = useUser();
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (syncedRef.current === user.id) return;

    const email = user.primaryEmailAddress?.emailAddress;
    const name = user.fullName || user.firstName || "";
    if (!email) return;

    syncedRef.current = user.id;

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clerk-sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerk_id: user.id,
        email,
        name,
      }),
    }).catch(() => {
      syncedRef.current = null;
    });
  }, [isLoaded, user]);

  return null;
}
