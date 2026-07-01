import { useState } from "react";
import { Modal } from "./Modal";
import { useAuth } from "../lib/AuthContext";
import { updateComplaintStatus } from "../lib/store";
import { formatDate, formatRelative, cn } from "../lib/utils";
import type { Complaint, ComplaintStatus } from "../types";
import { CategoryBadge, PriorityBadge, StatusBadge } from "./Badge";
import { Check, Clock, Photo, User, Warning } from "./Icons";

const STATUSES: ComplaintStatus[] = ["Open", "In Progress", "Resolved"];

export function ComplaintDetailModal({
  open,
  onClose,
  complaint,
}: {
  open: boolean;
  onClose: () => void;
  complaint: Complaint | null;
}) {
  const { state, setState, currentUser } = useAuth();
  const [note, setNote] = useState("");

  if (!complaint) return null;

  const isAdmin = currentUser?.role === "admin";
  const isOwner = currentUser?.id === complaint.residentId;
  const canManage = isAdmin;

  const changeStatus = (to: ComplaintStatus) => {
    if (!currentUser) return;
    setState(
      updateComplaintStatus(state, complaint.id, to, currentUser, note.trim() || undefined)
    );
    setNote("");
  };

  return (
    <Modal open={open} onClose={onClose} title="Complaint details" size="lg">
      <div className="space-y-5">
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-base font-semibold text-slate-900 leading-snug">
              {complaint.title}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
              {complaint.overdue && complaint.status !== "Resolved" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
                  <Warning className="h-3 w-3" /> Overdue
                </span>
              )}
              <StatusBadge status={complaint.status} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <CategoryBadge category={complaint.category} />
            <PriorityBadge priority={complaint.priority} />
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">
              Filed {formatRelative(complaint.createdAt)}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">
              Flat <span className="font-medium">{complaint.flat}</span>
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {complaint.description}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <User className="h-4 w-4" />
          <span>
            Raised by <span className="font-medium">{complaint.residentName}</span>
          </span>
        </div>

        {complaint.photos.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-2">
              <Photo className="h-4 w-4" /> Photos ({complaint.photos.length})
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {complaint.photos.map((p) => (
                <a
                  key={p.id}
                  href={p.dataUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="aspect-square rounded-md overflow-hidden border border-slate-200 bg-slate-50 block hover:opacity-90"
                  title={p.name}
                >
                  <img
                    src={p.dataUrl}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {canManage && complaint.status !== "Resolved" && (
          <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3 space-y-2">
            <label className="text-xs font-medium text-slate-700 block">
              Admin note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="E.g. Assigned to plumber, will resolve by tomorrow…"
              rows={2}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
            />
            <div className="flex flex-wrap gap-2">
              {STATUSES.filter((s) => s !== complaint.status).map((s) => (
                <button
                  key={s}
                  onClick={() => changeStatus(s)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition",
                    s === "Resolved"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : s === "In Progress"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-amber-500 text-white hover:bg-amber-600"
                  )}
                >
                  {s === "Resolved" && <Check className="h-3.5 w-3.5" />}
                  Mark as {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isAdmin && !isOwner && (
          <div className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-600">
            You can only update complaints you have raised.
          </div>
        )}

        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-2">
            <Clock className="h-4 w-4" /> Status history
          </div>
          <ol className="space-y-2">
            {complaint.history
              .slice()
              .reverse()
              .map((h) => (
                <li
                  key={h.id}
                  className="flex gap-3 items-start rounded-lg border border-slate-100 bg-white p-3"
                >
                  <div className="mt-0.5">
                    <span
                      className={cn(
                        "inline-block h-2.5 w-2.5 rounded-full",
                        h.to === "Open" && "bg-amber-500",
                        h.to === "In Progress" && "bg-blue-500",
                        h.to === "Resolved" && "bg-emerald-500"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900">
                      <span className="font-medium">{h.actorName}</span>{" "}
                      <span className="text-slate-500">
                        {(h.from as string) === "Created"
                          ? "raised the complaint"
                          : `changed status from ${h.from} to`}
                      </span>{" "}
                      {(h.from as string) !== "Created" && (
                        <span className="font-medium">{h.to}</span>
                      )}
                    </p>
                    {h.note && (
                      <p className="text-xs text-slate-600 mt-0.5 italic">
                        “{h.note}”
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(h.timestamp)}
                    </p>
                  </div>
                </li>
              ))}
          </ol>
        </div>
      </div>
    </Modal>
  );
}
