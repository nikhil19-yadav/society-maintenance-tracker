import { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { Building, User } from "./Icons";
import { cn } from "../lib/utils";

export function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFlat, setRegFlat] = useState("");
  const [regPhone, setRegPhone] = useState("");

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const r = login(loginEmail.trim(), loginPassword);
    if (!r.ok) setError(r.error || "Login failed");
  };

  const onRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    const r = register({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      flat: regFlat.trim() || undefined,
      phone: regPhone.trim() || undefined,
    });
    if (!r.ok) setError(r.error || "Registration failed");
  };

  const fillDemo = (kind: "admin" | "resident") => {
    if (kind === "admin") {
      setLoginEmail("admin@society.com");
      setLoginPassword("admin123");
    } else {
      setLoginEmail("riya@society.com");
      setLoginPassword("riya123");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
            <Building className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Society Maintenance Tracker
            </h1>
            <p className="text-xs text-slate-500">
              Complaints · Notice board · Updates
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex bg-slate-100 rounded-lg p-1 mb-5">
            <button
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={cn(
                "flex-1 text-sm font-medium py-1.5 rounded-md transition",
                mode === "login"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Sign in
            </button>
            <button
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={cn(
                "flex-1 text-sm font-medium py-1.5 rounded-md transition",
                mode === "register"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Register as resident
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={onLogin} className="space-y-3">
              <Field
                label="Email"
                type="email"
                value={loginEmail}
                onChange={setLoginEmail}
                placeholder="you@society.com"
                required
              />
              <Field
                label="Password"
                type="password"
                value={loginPassword}
                onChange={setLoginPassword}
                placeholder="••••••••"
                required
              />
              {error && (
                <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 text-white text-sm font-medium py-2.5 hover:bg-slate-800 transition"
              >
                Sign in
              </button>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-2">Try demo accounts:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemo("admin")}
                    className="text-xs rounded-md border border-slate-200 px-2 py-1.5 hover:bg-slate-50 flex items-center justify-center gap-1.5"
                  >
                    <User className="h-3.5 w-3.5" /> Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo("resident")}
                    className="text-xs rounded-md border border-slate-200 px-2 py-1.5 hover:bg-slate-50 flex items-center justify-center gap-1.5"
                  >
                    <User className="h-3.5 w-3.5" /> Resident
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={onRegister} className="space-y-3">
              <Field
                label="Full name"
                value={regName}
                onChange={setRegName}
                placeholder="Your name"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <Field
                  label="Flat no."
                  value={regFlat}
                  onChange={setRegFlat}
                  placeholder="A-101"
                />
                <Field
                  label="Phone"
                  value={regPhone}
                  onChange={setRegPhone}
                  placeholder="Optional"
                />
              </div>
              <Field
                label="Email"
                type="email"
                value={regEmail}
                onChange={setRegEmail}
                placeholder="you@society.com"
                required
              />
              <Field
                label="Password"
                type="password"
                value={regPassword}
                onChange={setRegPassword}
                placeholder="At least 6 characters"
                required
              />
              {error && (
                <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-600 text-white text-sm font-medium py-2.5 hover:bg-indigo-700 transition"
              >
                Create resident account
              </button>
              <p className="text-xs text-slate-500 text-center">
                New accounts are registered as residents. Admin accounts are
                provisioned by the society manager.
              </p>
            </form>
          )}
        </div>

        <p className="text-xs text-slate-400 text-center mt-4">
          Demo data is preloaded. Data persists in your browser (localStorage).
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-700 mb-1 block">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  );
}
