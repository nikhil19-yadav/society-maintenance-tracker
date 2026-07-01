import { useState } from "react";
import { Modal } from "./Modal";
import { useAuth } from "../lib/AuthContext";
import { createComplaint } from "../lib/store";
import type { Category, Priority } from "../types";
import { Photo, Plus, X } from "./Icons";

const CATEGORIES: Category[] = [
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Lift",
  "Security",
  "Parking",
  "Other",
];

const PRIORITIES: Priority[] = ["Low", "Medium", "High"];

export function NewComplaintModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { state, setState, currentUser } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Plumbing");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [photos, setPhotos] = useState<{ name: string; dataUrl: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
    setDescription("");
    setCategory("Plumbing");
    setPriority("Medium");
    setPhotos([]);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const onPickPhoto = async (files: FileList | null) => {
    if (!files) return;
    const list: { name: string; dataUrl: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.type.startsWith("image/")) continue;
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });
      list.push({ name: f.name, dataUrl });
    }
    setPhotos((p) => [...p, ...list]);
  };

  const removePhoto = (i: number) => {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!currentUser) return;
    if (title.trim().length < 4) {
      setError("Title should be at least 4 characters.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Please provide a more detailed description (10+ chars).");
      return;
    }
    const next = createComplaint(
      state,
      {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        photos,
      },
      currentUser
    );
    setState(next);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Raise a new complaint" size="lg">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Title" required>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short summary of the issue"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            required
          />
        </Field>

        <Field label="Description" required>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the problem, location, and any other helpful details…"
            rows={4}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Category" required>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority" required>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Photos (optional)">
          <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-slate-200 rounded-lg px-3 py-4 text-sm text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/40 cursor-pointer transition">
            <Photo className="h-4 w-4" />
            <span>Click to attach images</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onPickPhoto(e.target.files)}
              className="hidden"
            />
          </label>
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {photos.map((p, i) => (
                <div
                  key={i}
                  className="relative group rounded-md overflow-hidden border border-slate-200 aspect-square bg-slate-50"
                >
                  <img
                    src={p.dataUrl}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/70 text-white opacity-0 group-hover:opacity-100 transition"
                    aria-label="Remove photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Field>

        {error && (
          <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Submit complaint
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-700 mb-1 block">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      {children}
    </div>
  );
}
