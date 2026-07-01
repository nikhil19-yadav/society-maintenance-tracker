import { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { formatDate, formatRelative } from "../lib/utils";
import { Mail } from "./Icons";
import { EmptyState } from "./EmptyState";

export function EmailLogView() {
  const { state } = useAuth();
  const [filter, setFilter] = useState<"all" | "status-change" | "important-notice" | "registration">("all");

  const filtered = state.emails.filter((e) =>
    filter === "all" ? true : e.category === filter
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
          Email log
        </h1>
        <p className="text-sm text-slate-500">
          Simulated email notifications sent by the system. In production, these
          would be delivered through a transactional email service.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { v: "all", label: "All" },
            { v: "status-change", label: "Status changes" },
            { v: "important-notice", label: "Important notices" },
            { v: "registration", label: "Registrations" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.v}
            onClick={() => setFilter(opt.v)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              filter === opt.v
                ? "bg-slate-900 text-white border-slate-900"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white">
          <EmptyState
            icon={<Mail className="h-5 w-5" />}
            title="No emails yet"
            description="Trigger an action (status change, important notice) to see emails flow."
          />
        </div>
      ) : (
        <ul className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
          {filtered.map((e) => (
            <li key={e.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {e.subject}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    To: {e.toName} &lt;{e.to}&gt;
                  </p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 whitespace-pre-wrap">
                    {e.body}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-md ${
                      e.category === "status-change"
                        ? "bg-blue-50 text-blue-700"
                        : e.category === "important-notice"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {e.category.replace("-", " ")}
                  </span>
                  <span className="text-xs text-slate-400" title={e.sentAt}>
                    {formatRelative(e.sentAt)}
                  </span>
                </div>
              </div>
              <details className="mt-2">
                <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                  View full body
                </summary>
                <pre className="mt-2 text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-md p-3 whitespace-pre-wrap font-sans">
                  {e.body}
                </pre>
                <p className="text-xs text-slate-400 mt-1">
                  Sent at {formatDate(e.sentAt)}
                </p>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
