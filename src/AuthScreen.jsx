import { useState } from "react";
import { useAuth } from "./AuthContext.jsx";

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  const switchMode = () => {
    setMode(isRegister ? "login" : "register");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isRegister) {
        await register(username, password);
      } else {
        await login(username, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2" data-testid="authHeader">
            {isRegister ? "Create an account" : "Welcome back"}
          </h1>
          <p className="text-gray-500">
            {isRegister
              ? "Register to start tracking your todos."
              : "Log in to see your todos."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            data-testid="usernameInput"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isRegister ? "new-password" : "current-password"}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            data-testid="passwordInput"
          />

          {error && (
            <p className="text-sm text-red-600" data-testid="authError">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full px-6 py-3 rounded-2xl bg-black text-white font-medium hover:opacity-90 transition disabled:opacity-50"
            data-testid="authSubmit"
          >
            {busy ? "Please wait…" : isRegister ? "Register" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {isRegister ? "Already have an account?" : "Need an account?"}{" "}
          <button
            type="button"
            onClick={switchMode}
            className="font-medium text-black underline hover:opacity-70"
            data-testid="authToggle"
          >
            {isRegister ? "Log in" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}
