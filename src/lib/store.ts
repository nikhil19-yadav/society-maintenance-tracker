import type {
  AppState,
  User,
  Complaint,
  Notice,
  EmailLog,
  AppConfig,
  Category,
  Priority,
  ComplaintStatus,
  StatusEvent,
} from "../types";
import { uid } from "./utils";

const STORAGE_KEY = "smt.app.v1";

const DEFAULT_CONFIG: AppConfig = {
  overdueDays: 3,
  societyName: "Greenview Apartments",
};

const SEED_USERS: User[] = [
  {
    id: "u_admin",
    name: "Admin Manager",
    email: "admin@society.com",
    password: "admin123",
    role: "admin",
    phone: "9000000000",
    createdAt: new Date().toISOString(),
  },
  {
    id: "u_res1",
    name: "Riya Sharma",
    email: "riya@society.com",
    password: "riya123",
    role: "resident",
    flat: "A-101",
    phone: "9000000001",
    createdAt: new Date().toISOString(),
  },
  {
    id: "u_res2",
    name: "Aman Verma",
    email: "aman@society.com",
    password: "aman123",
    role: "resident",
    flat: "B-204",
    phone: "9000000002",
    createdAt: new Date().toISOString(),
  },
];

function seedComplaints(): Complaint[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const c1: Complaint = {
    id: uid("cmp"),
    title: "Leaking tap in kitchen",
    description:
      "The kitchen tap has been leaking continuously for two days. Water is pooling under the sink.",
    category: "Plumbing",
    priority: "Medium",
    status: "Open",
    residentId: "u_res1",
    residentName: "Riya Sharma",
    flat: "A-101",
    createdAt: new Date(now - 5 * day).toISOString(),
    updatedAt: new Date(now - 5 * day).toISOString(),
    photos: [],
    history: [
      {
        id: uid("hst"),
        timestamp: new Date(now - 5 * day).toISOString(),
        actorId: "u_res1",
        actorName: "Riya Sharma",
        from: "Created",
        to: "Open",
        note: "Complaint registered",
      },
    ],
    overdue: true,
  };

  const c2: Complaint = {
    id: uid("cmp"),
    title: "Lift making strange noise",
    description:
      "The lift on the B wing is making a grinding sound on every trip. Needs urgent inspection.",
    category: "Lift",
    priority: "High",
    status: "In Progress",
    residentId: "u_res2",
    residentName: "Aman Verma",
    flat: "B-204",
    createdAt: new Date(now - 2 * day).toISOString(),
    updatedAt: new Date(now - 1 * day).toISOString(),
    photos: [],
    history: [
      {
        id: uid("hst"),
        timestamp: new Date(now - 2 * day).toISOString(),
        actorId: "u_res2",
        actorName: "Aman Verma",
        from: "Created",
        to: "Open",
        note: "Complaint registered",
      },
      {
        id: uid("hst"),
        timestamp: new Date(now - 1 * day).toISOString(),
        actorId: "u_admin",
        actorName: "Admin Manager",
        from: "Open",
        to: "In Progress",
        note: "Assigned to lift maintenance vendor",
      },
    ],
    overdue: false,
  };

  const c3: Complaint = {
    id: uid("cmp"),
    title: "Corridor light not working",
    description: "The corridor light on the 2nd floor of A wing is fused.",
    category: "Electrical",
    priority: "Low",
    status: "Resolved",
    residentId: "u_res1",
    residentName: "Riya Sharma",
    flat: "A-101",
    createdAt: new Date(now - 10 * day).toISOString(),
    updatedAt: new Date(now - 8 * day).toISOString(),
    resolvedAt: new Date(now - 8 * day).toISOString(),
    photos: [],
    history: [
      {
        id: uid("hst"),
        timestamp: new Date(now - 10 * day).toISOString(),
        actorId: "u_res1",
        actorName: "Riya Sharma",
        from: "Created",
        to: "Open",
      },
      {
        id: uid("hst"),
        timestamp: new Date(now - 9 * day).toISOString(),
        actorId: "u_admin",
        actorName: "Admin Manager",
        from: "Open",
        to: "In Progress",
        note: "Electrician dispatched",
      },
      {
        id: uid("hst"),
        timestamp: new Date(now - 8 * day).toISOString(),
        actorId: "u_admin",
        actorName: "Admin Manager",
        from: "In Progress",
        to: "Resolved",
        note: "Bulb replaced and verified",
      },
    ],
    overdue: false,
  };

  return [c1, c2, c3];
}

function seedNotices(): Notice[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  return [
    {
      id: uid("ntc"),
      title: "Water supply disruption on Sunday",
      body: "Please note that water supply will be disrupted on Sunday from 9 AM to 1 PM due to scheduled maintenance of the overhead tank. Kindly store water in advance.",
      authorId: "u_admin",
      authorName: "Admin Manager",
      important: true,
      pinned: true,
      createdAt: new Date(now - 1 * day).toISOString(),
    },
    {
      id: uid("ntc"),
      title: "Quarterly society meeting",
      body: "The quarterly society meeting is scheduled for the last Saturday of this month at 6 PM in the community hall. All residents are encouraged to attend.",
      authorId: "u_admin",
      authorName: "Admin Manager",
      important: false,
      pinned: false,
      createdAt: new Date(now - 4 * day).toISOString(),
    },
  ];
}

function defaultState(): AppState {
  return {
    users: SEED_USERS,
    complaints: seedComplaints(),
    notices: seedNotices(),
    emails: [],
    config: { ...DEFAULT_CONFIG },
    currentUserId: null,
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = defaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as AppState;
    // Ensure config exists (forward compat)
    if (!parsed.config) parsed.config = { ...DEFAULT_CONFIG };
    return parsed;
  } catch {
    const seeded = defaultState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(): AppState {
  const seeded = defaultState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

// ====== Domain helpers ======

export function isOverdue(
  createdAt: string,
  status: ComplaintStatus,
  thresholdDays: number
): boolean {
  if (status === "Resolved") return false;
  const age = Date.now() - new Date(createdAt).getTime();
  return age > thresholdDays * 24 * 60 * 60 * 1000;
}

export function recomputeOverdue(state: AppState): AppState {
  const overdueDays = state.config.overdueDays;
  const complaints = state.complaints.map((c) => ({
    ...c,
    overdue: isOverdue(c.createdAt, c.status, overdueDays),
  }));
  return { ...state, complaints };
}

export function sendEmail(
  state: AppState,
  to: User,
  subject: string,
  body: string,
  category: EmailLog["category"]
): AppState {
  const log: EmailLog = {
    id: uid("eml"),
    to: to.email,
    toName: to.name,
    subject,
    body,
    sentAt: new Date().toISOString(),
    category,
  };
  return { ...state, emails: [log, ...state.emails].slice(0, 200) };
}

export function createComplaint(
  state: AppState,
  payload: {
    title: string;
    description: string;
    category: Category;
    priority: Priority;
    photos: { name: string; dataUrl: string }[];
  },
  resident: User
): AppState {
  const now = new Date().toISOString();
  const id = uid("cmp");
  const event: StatusEvent = {
    id: uid("hst"),
    timestamp: now,
    actorId: resident.id,
    actorName: resident.name,
    from: "Created",
    to: "Open",
    note: "Complaint registered",
  };
  const complaint: Complaint = {
    id,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    priority: payload.priority,
    status: "Open",
    residentId: resident.id,
    residentName: resident.name,
    flat: resident.flat || "—",
    createdAt: now,
    updatedAt: now,
    photos: payload.photos.map((p) => ({
      id: uid("ph"),
      name: p.name,
      dataUrl: p.dataUrl,
      uploadedAt: now,
    })),
    history: [event],
    overdue: false,
  };
  let next: AppState = {
    ...state,
    complaints: [complaint, ...state.complaints],
  };
  next = recomputeOverdue(next);
  return next;
}

export function updateComplaintStatus(
  state: AppState,
  complaintId: string,
  to: ComplaintStatus,
  actor: User,
  note?: string
): AppState {
  const now = new Date().toISOString();
  const complaints = state.complaints.map((c) => {
    if (c.id !== complaintId) return c;
    const event: StatusEvent = {
      id: uid("hst"),
      timestamp: now,
      actorId: actor.id,
      actorName: actor.name,
      from: c.status,
      to,
      note,
    };
    return {
      ...c,
      status: to,
      updatedAt: now,
      resolvedAt: to === "Resolved" ? now : c.resolvedAt,
      history: [...c.history, event],
    };
  });
  let next: AppState = { ...state, complaints };
  next = recomputeOverdue(next);

  // Send email to the complaint owner if the actor is admin
  if (actor.role === "admin") {
    const updated = next.complaints.find((c) => c.id === complaintId);
    if (updated) {
      const owner = next.users.find((u) => u.id === updated.residentId);
      if (owner) {
        next = sendEmail(
          next,
          owner,
          `[Society] Your complaint "${updated.title}" is now ${to}`,
          `Hi ${owner.name},\n\nYour complaint "${updated.title}" (Flat ${updated.flat}) has been updated.\n\nNew status: ${to}\n${note ? `Note from admin: ${note}\n` : ""}\nYou can view full details by logging in to the Society Maintenance Tracker.\n\n— ${next.config.societyName} Admin`,
          "status-change"
        );
      }
    }
  }
  return next;
}

export function addNotice(
  state: AppState,
  payload: { title: string; body: string; important: boolean },
  author: User
): AppState {
  const now = new Date().toISOString();
  const notice: Notice = {
    id: uid("ntc"),
    title: payload.title,
    body: payload.body,
    authorId: author.id,
    authorName: author.name,
    important: payload.important,
    pinned: payload.important, // important notices are pinned to top automatically
    createdAt: now,
  };
  let next: AppState = { ...state, notices: [notice, ...state.notices] };

  // Email all residents about important notices
  if (payload.important) {
    const residents = next.users.filter((u) => u.role === "resident");
    residents.forEach((r) => {
      next = sendEmail(
        next,
        r,
        `[Important] ${payload.title}`,
        `Hi ${r.name},\n\nAn important notice has been posted on the ${next.config.societyName} notice board:\n\n"${payload.title}"\n\n${payload.body}\n\n— ${next.config.societyName} Admin`,
        "important-notice"
      );
    });
  }
  return next;
}

export function registerUser(
  state: AppState,
  payload: { name: string; email: string; password: string; flat?: string; phone?: string }
): { state: AppState; user: User | null; error?: string } {
  const exists = state.users.some(
    (u) => u.email.toLowerCase() === payload.email.toLowerCase()
  );
  if (exists) {
    return { state, user: null, error: "An account with that email already exists." };
  }
  const user: User = {
    id: uid("usr"),
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: "resident",
    flat: payload.flat,
    phone: payload.phone,
    createdAt: new Date().toISOString(),
  };
  let next: AppState = { ...state, users: [...state.users, user] };
  next = sendEmail(
    next,
    user,
    `Welcome to ${state.config.societyName}`,
    `Hi ${user.name},\n\nYour resident account has been created. You can now log complaints and track their status on the ${state.config.societyName} Maintenance Tracker.\n\n— Admin`,
    "registration"
  );
  return { state: next, user };
}
