import { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { resetState } from "../lib/store";
import { Cog, Warning } from "./Icons";

export function SettingsView() {
  const { state, setState, currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const [overdueDays, setOverdueDays] = useState(state.config.overdueDays);
  const [societyName, setSocietyName] = useState(state.config.societyName);
  const [saved, setSaved] = useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const days = Math.max(1, Math.min(60, Number(overdueDays) || 3));
    setState({
      ...state,
      config: {
        overdueDays: days,
        societyName: societyName.trim() || state.config.societyName,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const onReset = () => {
    if (
      !window.confirm(
        "This will erase all complaints, notices, and accounts, and reload seed data. Continue?"
      )
    )
      return;
    setState(resetState());
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
          Settings
        </h1>
        <p className="text-sm text-slate-500">
          Configure society-wide behavior of the tracker.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Cog className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">General</h2>
        </div>
        {isAdmin ? (
          <form onSubmit={save} className="space-y-3 max-w-md">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                Society name
              </label>
              <input
                value={societyName}
                onChange={(e) => setSocietyName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                Overdue threshold (days)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={overdueDays}
                onChange={(e) => setOverdueDays(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <p className="text-xs text-slate-500 mt-1">
                Complaints that remain unresolved for more than this many days
                will be flagged as overdue.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800"
              >
                Save changes
              </button>
              {saved && (
                <span className="text-xs text-emerald-600">
                  Saved successfully
                </span>
              )}
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-500">
            Only the society admin can change these settings.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-2">
          <Warning className="h-4 w-4 text-rose-600" />
          <h2 className="text-sm font-semibold text-rose-900">Danger zone</h2>
        </div>
        <p className="text-sm text-rose-700 mb-3">
          Reset the application to its initial seed data. All complaints,
          notices, accounts, and emails will be cleared.
        </p>
        {isAdmin ? (
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-rose-600 text-white hover:bg-rose-700"
          >
            Reset demo data
          </button>
        ) : (
          <p className="text-xs text-rose-700">
            Only the society admin can reset the data.
          </p>
        )}
      </div>
    </div>
  );
}
