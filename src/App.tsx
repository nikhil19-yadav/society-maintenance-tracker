import { useState } from "react";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { AuthScreen } from "./components/AuthScreen";
import {
  Building,
  Chart,
  Clipboard,
  Cog,
  Logout,
  Mail,
  Megaphone,
  X,
} from "./components/Icons";
import { ComplaintsView } from "./components/ComplaintsView";
import { NoticeBoard } from "./components/NoticeBoard";
import { Dashboard } from "./components/Dashboard";
import { EmailLogView } from "./components/EmailLog";
import { SettingsView } from "./components/SettingsView";
import { ComplaintDetailModal } from "./components/ComplaintDetailModal";
import type { Complaint } from "./types";
import { cn } from "./lib/utils";

type ViewKey = "dashboard" | "complaints" | "notices" | "emails" | "settings";

interface NavItem {
  key: ViewKey;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: <Chart className="h-4 w-4" /> },
  { key: "complaints", label: "Complaints", icon: <Clipboard className="h-4 w-4" /> },
  { key: "notices", label: "Notice board", icon: <Megaphone className="h-4 w-4" /> },
  { key: "emails", label: "Email log", icon: <Mail className="h-4 w-4" />, adminOnly: true },
  { key: "settings", label: "Settings", icon: <Cog className="h-4 w-4" /> },
];

function AppShell() {
  const { currentUser, logout, state } = useAuth();
  const [view, setView] = useState<ViewKey>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [detailComplaint, setDetailComplaint] = useState<Complaint | null>(null);

  if (!currentUser) {
    return <AuthScreen />;
  }

  const isAdmin = currentUser.role === "admin";
  const items = NAV.filter((n) => !n.adminOnly || isAdmin);

  const openComplaint = (c: Complaint) => {
    setDetailComplaint(c);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm sm:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform sm:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        )}
      >
        <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm shrink-0">
              <Building className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {state.config.societyName}
              </p>
              <p className="text-xs text-slate-500">Maintenance Tracker</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="sm:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {items.map((item) => {
            const active = view === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setView(item.key);
                  setMobileOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition",
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <span
                  className={cn(
                    active ? "text-white" : "text-slate-400"
                  )}
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
            <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
              {currentUser.name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {isAdmin ? "Administrator" : `Resident · ${currentUser.flat || "—"}`}
              </p>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-rose-600"
              aria-label="Sign out"
            >
              <Logout className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="sm:pl-64">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200 h-16 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="sm:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100"
              aria-label="Open menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 capitalize">
                {NAV.find((n) => n.key === view)?.label}
              </h2>
              <p className="text-xs text-slate-500 hidden sm:block">
                {state.config.societyName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="hidden sm:inline">
              Signed in as <span className="font-medium text-slate-700">{currentUser.email}</span>
            </span>
          </div>
        </header>

        <main className="p-4 sm:p-6 max-w-6xl mx-auto">
          {view === "dashboard" && <Dashboard onOpenComplaint={openComplaint} />}
          {view === "complaints" && <ComplaintsView />}
          {view === "notices" && <NoticeBoard />}
          {view === "emails" && isAdmin && <EmailLogView />}
          {view === "settings" && <SettingsView />}
        </main>
      </div>

      <ComplaintDetailModal
        open={!!detailComplaint}
        onClose={() => setDetailComplaint(null)}
        complaint={detailComplaint}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
