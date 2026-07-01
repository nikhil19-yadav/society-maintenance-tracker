import { useMemo } from "react";
import { useAuth } from "../lib/AuthContext";
import { CategoryBadge, StatusBadge } from "./Badge";
import { formatRelative } from "../lib/utils";
import type { Complaint } from "../types";
import { Chart, Clipboard, Megaphone, Warning, Mail } from "./Icons";

interface DashboardProps {
  onOpenComplaint: (c: Complaint) => void;
}

export function Dashboard({ onOpenComplaint }: DashboardProps) {
  const { state, currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const myComplaints = useMemo(
    () => state.complaints.filter((c) => c.residentId === currentUser?.id),
    [state.complaints, currentUser]
  );

  // Status counts
  const byStatus = useMemo(() => {
    const counts: Record<string, number> = {
      Open: 0,
      "In Progress": 0,
      Resolved: 0,
    };
    const source = isAdmin ? state.complaints : myComplaints;
    source.forEach((c) => (counts[c.status] = (counts[c.status] || 0) + 1));
    return counts;
  }, [state.complaints, myComplaints, isAdmin]);

  // Category counts (admin)
  const byCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    state.complaints.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [state.complaints]);

  const overdueCount = useMemo(
    () => state.complaints.filter((c) => c.overdue).length,
    [state.complaints]
  );

  const recentComplaints = useMemo(() => {
    const list = isAdmin ? state.complaints : myComplaints;
    return [...list]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 5);
  }, [state.complaints, myComplaints, isAdmin]);

  const importantNotices = useMemo(
    () =>
      state.notices
        .filter((n) => n.important)
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 3),
    [state.notices]
  );

  const totalComplaints = isAdmin ? state.complaints.length : myComplaints.length;
  const maxCat = Math.max(1, ...Object.values(byCategory));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
          Welcome back, {currentUser?.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-slate-500">
          {isAdmin
            ? `Here's a snapshot of activity at ${state.config.societyName}.`
            : "Here's a quick look at your complaints and society updates."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label={isAdmin ? "Total complaints" : "My complaints"}
          value={totalComplaints}
          icon={<Clipboard className="h-4 w-4" />}
          tone="indigo"
        />
        <StatCard
          label="Open"
          value={byStatus["Open"] || 0}
          icon={<Chart className="h-4 w-4" />}
          tone="amber"
        />
        <StatCard
          label="In progress"
          value={byStatus["In Progress"] || 0}
          icon={<Chart className="h-4 w-4" />}
          tone="blue"
        />
        <StatCard
          label="Overdue"
          value={overdueCount}
          icon={<Warning className="h-4 w-4" />}
          tone="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Recent activity
            </h2>
            <span className="text-xs text-slate-500">
              {recentComplaints.length} updated
            </span>
          </div>
          {recentComplaints.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              No complaints yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentComplaints.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onOpenComplaint(c)}
                    className="w-full text-left py-3 flex items-center gap-3 hover:bg-slate-50 -mx-2 px-2 rounded-md"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {c.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <CategoryBadge category={c.category} />
                        <span className="text-xs text-slate-500">
                          {c.residentName} · Flat {c.flat}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <StatusBadge status={c.status} />
                      <span className="text-xs text-slate-400">
                        {formatRelative(c.updatedAt)}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          {isAdmin && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex items-center gap-1.5 mb-3">
                <Chart className="h-4 w-4 text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-900">
                  By category
                </h2>
              </div>
              {Object.keys(byCategory).length === 0 ? (
                <p className="text-sm text-slate-500">No data yet.</p>
              ) : (
                <ul className="space-y-2">
                  {Object.entries(byCategory)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, n]) => (
                      <li key={cat}>
                        <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                          <span>{cat}</span>
                          <span className="font-medium">{n}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${(n / maxCat) * 100}%` }}
                          />
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex items-center gap-1.5 mb-3">
              <Megaphone className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-slate-900">
                Important notices
              </h2>
            </div>
            {importantNotices.length === 0 ? (
              <p className="text-sm text-slate-500">No important notices.</p>
            ) : (
              <ul className="space-y-3">
                {importantNotices.map((n) => (
                  <li
                    key={n.id}
                    className="rounded-lg border border-amber-100 bg-amber-50/40 p-3"
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                      {n.body}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {formatRelative(n.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex items-center gap-1.5 mb-3">
            <Mail className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">
              Recent email notifications
            </h2>
          </div>
          <EmailLogPreview />
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "indigo" | "amber" | "blue" | "rose" | "emerald";
}) {
  const toneClass: Record<typeof tone, string> = {
    indigo: "bg-indigo-50 text-indigo-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    rose: "bg-rose-50 text-rose-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <span className={`p-1.5 rounded-md ${toneClass[tone]}`}>{icon}</span>
      </div>
      <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function EmailLogPreview() {
  const { state, currentUser } = useAuth();
  const myEmails = state.emails
    .filter((e) => e.to === currentUser?.email)
    .slice(0, 5);
  if (myEmails.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        You will be notified by email when your complaint status changes or when an
        important notice is posted.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-slate-100">
      {myEmails.map((e) => (
        <li key={e.id} className="py-2.5">
          <p className="text-sm font-medium text-slate-900">{e.subject}</p>
          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{e.body}</p>
          <p className="text-xs text-slate-400 mt-1">{formatRelative(e.sentAt)}</p>
        </li>
      ))}
    </ul>
  );
}
