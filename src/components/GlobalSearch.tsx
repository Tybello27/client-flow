"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { money } from "@/lib/utils";
import { Icon, type IconName } from "./Icon";
import type { NavKey } from "./App";

interface Result {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  view: NavKey;
}

export function GlobalSearch({
  open,
  onClose,
  onNav,
}: {
  open: boolean;
  onClose: () => void;
  onNav: (v: NavKey) => void;
}) {
  const { data } = useStore();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo<Result[]>(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const out: Result[] = [];
    data.clients.forEach((c) => {
      if (`${c.company} ${c.name} ${c.email}`.toLowerCase().includes(term))
        out.push({ id: c.id, title: c.company, subtitle: `Client · ${c.name}`, icon: "users", view: "clients" });
    });
    data.leads.forEach((l) => {
      if (`${l.name} ${l.company}`.toLowerCase().includes(term))
        out.push({ id: l.id, title: l.name, subtitle: `Lead · ${money(l.value, true)}`, icon: "leads", view: "leads" });
    });
    data.projects.forEach((p) => {
      if (p.name.toLowerCase().includes(term))
        out.push({ id: p.id, title: p.name, subtitle: `Project · ${p.progress}%`, icon: "projects", view: "projects" });
    });
    data.invoices.forEach((i) => {
      if (`${i.number}`.toLowerCase().includes(term))
        out.push({ id: i.id, title: i.number, subtitle: `Invoice · ${money(i.amount, true)}`, icon: "invoices", view: "invoices" });
    });
    data.quotes.forEach((qt) => {
      if (qt.number.toLowerCase().includes(term))
        out.push({ id: qt.id, title: qt.number, subtitle: `Quote · ${qt.status}`, icon: "quotes", view: "quotes" });
    });
    data.notes.forEach((n) => {
      if (`${n.title} ${n.body}`.toLowerCase().includes(term))
        out.push({ id: n.id, title: n.title, subtitle: "Meeting note", icon: "notes", view: "notes" });
    });
    return out.slice(0, 12);
  }, [q, data]);

  const quick: { label: string; icon: IconName; view: NavKey }[] = [
    { label: "Clients", icon: "users", view: "clients" },
    { label: "Leads", icon: "leads", view: "leads" },
    { label: "Projects", icon: "projects", view: "projects" },
    { label: "Invoices", icon: "invoices", view: "invoices" },
    { label: "Quotes", icon: "quotes", view: "quotes" },
    { label: "Calendar", icon: "calendar", view: "calendar" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 pt-[10vh] backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
            className="card w-full max-w-xl overflow-hidden rounded-3xl"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-white/5">
              <Icon name="search" size={20} className="text-slate-400" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search clients, projects, invoices…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <kbd className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-white/10">Esc</kbd>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2">
              {!q && (
                <>
                  <p className="px-3 py-2 text-xs font-semibold text-slate-400">Quick navigation</p>
                  <div className="grid grid-cols-2 gap-1.5 p-1 sm:grid-cols-3">
                    {quick.map((qk) => (
                      <button key={qk.view} onClick={() => onNav(qk.view)} className="flex items-center gap-2 rounded-2xl p-2.5 text-left transition hover:bg-slate-100 dark:hover:bg-white/5">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                          <Icon name={qk.icon} size={16} />
                        </span>
                        <span className="text-sm font-semibold">{qk.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {q && results.length === 0 && (
                <p className="py-10 text-center text-sm text-slate-400">No results for “{q}”</p>
              )}

              {results.map((r) => (
                <button key={`${r.view}-${r.id}`} onClick={() => onNav(r.view)} className="flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition hover:bg-slate-100 dark:hover:bg-white/5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500/10 to-purple-500/10 text-brand-600 dark:text-brand-300">
                    <Icon name={r.icon} size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{r.title}</p>
                    <p className="truncate text-xs text-slate-400">{r.subtitle}</p>
                  </div>
                  <Icon name="chevronRight" size={16} className="text-slate-300" />
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
