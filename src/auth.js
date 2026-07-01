// Client-side-only "auth" backed by localStorage.
//
// SECURITY NOTE: This is for a demo/prototype only. Everything lives in the
// browser, so it is NOT secure — passwords are SHA-256 hashed (so they aren't
// stored in plain text), but anyone with access to the browser can read or
// forge the stored data. Real authentication requires a backend.

const USERS_KEY = "users";

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function getUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/** Create a new account. Returns the stored username on success, throws on error. */
export async function registerUser(username, password) {
  username = username.trim();
  if (!username || !password) {
    throw new Error("Username and password are required.");
  }

  const users = getUsers();
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error("That username is already taken.");
  }

  const passwordHash = await hashPassword(password);
  users.push({ username, passwordHash });
  saveUsers(users);
  return username;
}

/** Check credentials. Returns the stored username on success, throws on error. */
export async function verifyUser(username, password) {
  username = username.trim();
  const user = getUsers().find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  if (!user) {
    throw new Error("No account found with that username.");
  }

  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    throw new Error("Incorrect password.");
  }
  return user.username;
}
