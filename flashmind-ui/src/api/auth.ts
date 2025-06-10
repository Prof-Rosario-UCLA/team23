
type AuthResponse = {
  username: string;
};

export async function signup(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`http://34.105.4.82/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Signup failed");
  }

  return await res.json();
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`http://34.105.4.82/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("Login failed");
  return await res.json();
}

export async function logout(): Promise<void> {
  await fetch(`http://34.105.4.82/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function getMe(): Promise<AuthResponse> {
  const res = await fetch(`http://34.105.4.82/api/auth/me`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Not authenticated");
  return await res.json();
}
