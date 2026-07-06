"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AppData,
  Client,
  Invoice,
  Lead,
  Note,
  Project,
  Quote,
  CalendarEvent,
  Activity,
  Notification,
  Profile,
} from "./types";
import { createSeed } from "./seed";
import { uid } from "./utils";

const DATA_KEY = "clientflow.data.v1";
const THEME_KEY = "clientflow.theme.v1";

type Theme = "light" | "dark";

interface StoreValue {
  data: AppData;
  theme: Theme;
  toggleTheme: () => void;
  loading: boolean;
  update: (fn: (draft: AppData) => void) => void;
  pushActivity: (a: Omit<Activity, "id" | "at">) => void;
  pushNotification: (n: Omit<Notification, "id" | "at" | "read">) => void;
  markAllRead: () => void;
  resetData: () => void;
  // clients
  addClient: (c: Omit<Client, "id" | "createdAt">) => void;
  updateClient: (id: string, patch: Partial<Client>) => void;
  removeClient: (id: string) => void;
  // leads
  addLead: (l: Omit<Lead, "id" | "createdAt">) => void;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  removeLead: (id: string) => void;
  // quotes
  addQuote: (q: Omit<Quote, "id" | "createdAt">) => void;
  updateQuote: (id: string, patch: Partial<Quote>) => void;
  removeQuote: (id: string) => void;
  // projects
  addProject: (p: Omit<Project, "id" | "createdAt">) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  removeProject: (id: string) => void;
  // invoices
  addInvoice: (i: Omit<Invoice, "id">) => void;
  updateInvoice: (id: string, patch: Partial<Invoice>) => void;
  removeInvoice: (id: string) => void;
  // notes
  addNote: (n: Omit<Note, "id" | "createdAt">) => void;
  updateNote: (id: string, patch: Partial<Note>) => void;
  removeNote: (id: string) => void;
  // events
  addEvent: (e: Omit<CalendarEvent, "id">) => void;
  removeEvent: (id: string) => void;
  updateProfile: (patch: Partial<Profile>) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function loadData(): AppData {
  if (typeof window === "undefined") return createSeed();
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) {
      const seed = createSeed();
      localStorage.setItem(DATA_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as AppData;
    if (parsed.version !== 1) {
      const seed = createSeed();
      localStorage.setItem(DATA_KEY, JSON.stringify(seed));
      return seed;
    }
    return parsed;
  } catch {
    return createSeed();
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => createSeed());
  const [theme, setTheme] = useState<Theme>("light");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setData(loadData());
    const savedTheme = (localStorage.getItem(THEME_KEY) as Theme) || "light";
    setTheme(savedTheme);
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const persist = useCallback((next: AppData) => {
    setData(next);
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
  }, []);

  const update = useCallback(
    (fn: (draft: AppData) => void) => {
      setData((prev) => {
        const draft: AppData = JSON.parse(JSON.stringify(prev));
        fn(draft);
        try {
          localStorage.setItem(DATA_KEY, JSON.stringify(draft));
        } catch {
          /* ignore */
        }
        return draft;
      });
    },
    []
  );

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === "light" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  const pushActivity = useCallback(
    (a: Omit<Activity, "id" | "at">) => {
      update((d) => {
        d.activities.unshift({ ...a, id: uid("ac"), at: Date.now() });
        d.activities = d.activities.slice(0, 40);
      });
    },
    [update]
  );

  const pushNotification = useCallback(
    (n: Omit<Notification, "id" | "at" | "read">) => {
      update((d) => {
        d.notifications.unshift({ ...n, id: uid("nt"), at: Date.now(), read: false });
        d.notifications = d.notifications.slice(0, 40);
      });
    },
    [update]
  );

  const markAllRead = useCallback(() => {
    update((d) => {
      d.notifications = d.notifications.map((n) => ({ ...n, read: true }));
    });
  }, [update]);

  const resetData = useCallback(() => {
    const seed = createSeed();
    persist(seed);
  }, [persist]);

  const value = useMemo<StoreValue>(
    () => ({
      data,
      theme,
      toggleTheme,
      loading,
      update,
      pushActivity,
      pushNotification,
      markAllRead,
      resetData,
      addClient: (c) =>
        update((d) => {
          const client: Client = { ...c, id: uid("c"), createdAt: Date.now() };
          d.clients.unshift(client);
          d.activities.unshift({ id: uid("ac"), type: "client", text: `New client: ${client.company}`, at: Date.now() });
        }),
      updateClient: (id, patch) => update((d) => {
        const i = d.clients.findIndex((x) => x.id === id);
        if (i >= 0) d.clients[i] = { ...d.clients[i], ...patch };
      }),
      removeClient: (id) => update((d) => { d.clients = d.clients.filter((x) => x.id !== id); }),
      addLead: (l) => update((d) => {
        const lead: Lead = { ...l, id: uid("l"), createdAt: Date.now() };
        d.leads.unshift(lead);
        d.activities.unshift({ id: uid("ac"), type: "lead", text: `New lead: ${lead.name}`, at: Date.now() });
      }),
      updateLead: (id, patch) => update((d) => {
        const i = d.leads.findIndex((x) => x.id === id);
        if (i >= 0) d.leads[i] = { ...d.leads[i], ...patch };
      }),
      removeLead: (id) => update((d) => { d.leads = d.leads.filter((x) => x.id !== id); }),
      addQuote: (q) => update((d) => {
        const quote: Quote = { ...q, id: uid("q"), createdAt: Date.now() };
        d.quotes.unshift(quote);
        d.activities.unshift({ id: uid("ac"), type: "quote", text: `Quote created: ${quote.number}`, at: Date.now() });
      }),
      updateQuote: (id, patch) => update((d) => {
        const i = d.quotes.findIndex((x) => x.id === id);
        if (i >= 0) d.quotes[i] = { ...d.quotes[i], ...patch };
      }),
      removeQuote: (id) => update((d) => { d.quotes = d.quotes.filter((x) => x.id !== id); }),
      addProject: (p) => update((d) => {
        const project: Project = { ...p, id: uid("p"), createdAt: Date.now() };
        d.projects.unshift(project);
        d.activities.unshift({ id: uid("ac"), type: "project", text: `New project: ${project.name}`, at: Date.now() });
      }),
      updateProject: (id, patch) => update((d) => {
        const i = d.projects.findIndex((x) => x.id === id);
        if (i >= 0) d.projects[i] = { ...d.projects[i], ...patch };
      }),
      removeProject: (id) => update((d) => { d.projects = d.projects.filter((x) => x.id !== id); }),
      addInvoice: (inv) => update((d) => {
        const invoice: Invoice = { ...inv, id: uid("i") };
        d.invoices.unshift(invoice);
        d.activities.unshift({ id: uid("ac"), type: "invoice", text: `Invoice created: ${invoice.number}`, at: Date.now() });
      }),
      updateInvoice: (id, patch) => update((d) => {
        const i = d.invoices.findIndex((x) => x.id === id);
        if (i >= 0) d.invoices[i] = { ...d.invoices[i], ...patch };
      }),
      removeInvoice: (id) => update((d) => { d.invoices = d.invoices.filter((x) => x.id !== id); }),
      addNote: (n) => update((d) => {
        const note: Note = { ...n, id: uid("n"), createdAt: Date.now() };
        d.notes.unshift(note);
        d.activities.unshift({ id: uid("ac"), type: "note", text: `Note added: ${note.title}`, at: Date.now() });
      }),
      updateNote: (id, patch) => update((d) => {
        const i = d.notes.findIndex((x) => x.id === id);
        if (i >= 0) d.notes[i] = { ...d.notes[i], ...patch };
      }),
      removeNote: (id) => update((d) => { d.notes = d.notes.filter((x) => x.id !== id); }),
      addEvent: (e) => update((d) => { d.events.push({ ...e, id: uid("e") }); }),
      removeEvent: (id) => update((d) => { d.events = d.events.filter((x) => x.id !== id); }),
      updateProfile: (patch) => update((d) => { d.profile = { ...d.profile, ...patch }; }),
    }),
    [data, theme, toggleTheme, loading, update, pushActivity, pushNotification, markAllRead, resetData]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
