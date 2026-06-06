"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export interface AppUser {
  email: string;
  name?: string;
  authType: "clerk" | "local";
}

function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function resolveLocalUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  const payload = parseJwt(token);
  if (payload && typeof payload.sub === "string") {
    return {
      email: payload.sub,
      name: typeof payload.name === "string" ? payload.name : undefined,
      authType: "local",
    };
  }
  return null;
}

export function useCurrentUser(): { user: AppUser | null; loading: boolean } {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [localUser, setLocalUser] = useState<AppUser | null>(null);
  const [localLoaded, setLocalLoaded] = useState(false);

  useEffect(() => {
    setLocalUser(resolveLocalUser());
    setLocalLoaded(true);
  }, []);

  if (!clerkLoaded || !localLoaded) {
    return { user: null, loading: true };
  }

  if (isSignedIn && clerkUser) {
    const email = clerkUser.primaryEmailAddress?.emailAddress;
    if (email) {
      return {
        user: {
          email,
          name: clerkUser.fullName || clerkUser.firstName || undefined,
          authType: "clerk",
        },
        loading: false,
      };
    }
  }

  return { user: localUser, loading: false };
}
