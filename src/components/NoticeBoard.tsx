import { useMemo, useState } from "react";
import { Modal } from "./Modal";
import { useAuth } from "../lib/AuthContext";
import { addNotice } from "../lib/store";
import { formatDate, formatRelative } from "../lib/utils";
import { Megaphone, Pin, Plus, X } from "./Icons";
import { EmptyState } from "./EmptyState";

export function NoticeBoard() {
  const { state, currentUser } = useAuth();
  const [open, setOpen] = useState(false);

  const isAdmin = currentUser?.role === "admin";

  const sorted = useMemo(() => {
    return state.notices
      .slice()
      .sort((a, b) => {
        // Important pinned first
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        if (a.important !== b.important) return a.important ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [state.notices]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
            Notice board
          </h1>
          <p className="text-sm text-slate-500">
            Society announcements and updates.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            <Plus className="h-4 w-4" /> Post notice
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white">
          <EmptyState
            icon={<Megaphone className="h-5 w-5" />}
            title="No notices yet"
            description="The admin will post society announcements here."
          />
        </div>
      ) : (
        <ul className="space-y-3">
          {sorted.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border bg-white p-4 sm:p-5 ${
                n.important
                  ? "border-amber-200 bg-amber-50/40"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  {n.pinned && (
                    <Pin className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  )}
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                    {n.title}
                    {n.important && (
                      <span className="ml-2 inline-flex items-center rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
                        Important
                      </span>
                    )}
                  </h3>
                </div>
                <span className="text-xs text-slate-500 shrink-0">
                  {formatRelative(n.createdAt)}
                </span>
              </div>
              <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap leading-relaxed">
                {n.body}
              </p>
              <p className="text-xs text-slate-400 mt-3">
                Posted by {n.authorName} · {formatDate(n.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <NewNoticeModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function NewNoticeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { state, setState, currentUser } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [important, setImportant] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
    setBody("");
    setImportant(false);
    setError(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!currentUser) return;
    if (title.trim().length < 4) {
      setError("Title should be at least 4 characters.");
      return;
    }
    if (body.trim().length < 10) {
      setError("Notice body should be at least 10 characters.");
      return;
    }
    const next = addNotice(
      state,
      { title: title.trim(), body: body.trim(), important },
      currentUser
    );
    setState(next);
    close();
  };

  return (
    <Modal open={open} onClose={close} title="Post a new notice" size="md">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-700 mb-1 block">
            Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short headline"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-700 mb-1 block">
            Body <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write the full announcement…"
            rows={5}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
            required
          />
        </div>
        <label className="flex items-start gap-2 cursor-pointer rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
          <input
            type="checkbox"
            checked={important}
            onChange={(e) => setImportant(e.target.checked)}
            className="mt-0.5 rounded border-slate-300"
          />
          <div>
            <p className="text-sm font-medium text-slate-900">
              Mark as important
            </p>
            <p className="text-xs text-slate-500">
              Pins to top of the board and emails all residents.
            </p>
          </div>
        </label>
        {error && (
          <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Post notice
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Suppress unused import warning
void X;
