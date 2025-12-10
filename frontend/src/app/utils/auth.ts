// Utility for handling JWT in localStorage
export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function removeToken() {
  localStorage.removeItem("token");
}

// Attach JWT to fetch requests
type FetchOptions = RequestInit & { auth?: boolean };

export async function apiFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  let headers: Record<string, string> = {};
  if (options.headers instanceof Headers) {
    options.headers.forEach((value, key) => {
      headers[key] = value;
    });
  } else if (Array.isArray(options.headers)) {
    options.headers.forEach(([key, value]) => {
      headers[key] = value;
    });
  } else if (options.headers) {
    headers = { ...options.headers } as Record<string, string>;
  }
  if (options.auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}
