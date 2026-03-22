import { useState, useEffect } from "react";

interface User {
  email: string;
  name?: string;
  [key: string]: any;
}

function parseJwt(token: string): any {
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
  } catch (e) {
    return null;
  }
}

function getInitialAuthState(): { user: User | null; loading: boolean } {
  if (typeof window === "undefined") {
    return { user: null, loading: true };
  }
  const token = localStorage.getItem("token");
  if (!token) {
    return { user: null, loading: false };
  }
  const payload = parseJwt(token);
  if (payload && payload.sub) {
    return { user: { email: payload.sub, name: payload.name }, loading: false };
  }
  return { user: null, loading: false };
}

export function useCurrentUser(): { user: User | null; loading: boolean } {
  const [state, setState] = useState(getInitialAuthState);

  useEffect(() => {
    setState(getInitialAuthState());
  }, []);

  return { user: state.user, loading: state.loading };
}
