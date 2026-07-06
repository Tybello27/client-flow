"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { relativeTime } from "@/lib/utils";
import { Icon, type IconName } from "./Icon";
import { Avatar } from "./ui";
import { Dashboard } from "./views/Dashboard";
import { Clients } from "./views/Clients";
import { Leads } from "./views/Leads";
import { Quotes } from "./views/Quotes";
import { Projects } from "./views/Projects";
import { Invoices } from "./views/Invoices";
import { Notes } from "./views/Notes";
import { Calendar } from "./views/Calendar";
import { Settings } from "./views/Settings";
import { LoadingScreen } from "./LoadingScreen";
import { GlobalSearch } from "./GlobalSearch";

export type NavKey =
  | "dashboard"
  | "clients"
  | "leads"
  | "quotes"
  | "projects"
  | "invoices"
  | "notes"
  | "calendar"
  | "settings";

const nav: { key: NavKey; label: string; icon: IconName }[] = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "clients", label: "Clients", icon: "clients" },
  { key: "leads", label: "Leads", icon: "leads" },
  { key: "quotes", label: "Quotes", icon: "quotes" },
  { key: "projects", label: "Projects", icon: "projects" },
  { key: "invoices", label: "Invoices", icon: "invoices" },
  { key: "notes", label: "Notes", icon: "notes" },
  { key: "calendar", label: "Calendar", icon: "calendar" },
  { key: "settings", label: "Settings", icon: "settings" },
];

const mobileNav: NavKey[] = ["dashboard", "clients", "leads", "invoices", "settings"];

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function App() {
  const { data, theme, toggleTheme, loading, markAllRead } = useStore();
  const [view, setView] = useState<NavKey>("dashboard");
  const [query] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [installEvent, setInstallEvent] = useState<BIPEvent | null>(null);
  const [showIosBanner, setShowIosBanner] = useState(false);

  const unread = data.notifications.filter((n) => !n.read).length;

  // PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    const dismissed = localStorage.getItem("clientflow.ios.dismissed") === "1";
    if (isIos && !standalone && !dismissed) {
      const t = setTimeout(() => setShowIosBanner(true), 2500);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function doInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  const title = useMemo(() => nav.find((n) => n.key === view)?.label ?? "Dashboard", [view]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="app-bg min-h-screen">
      <div className="mx-auto flex max-w-[1500px]">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200/70 px-4 py-6 lg:flex dark:border-white/5">
          <div className="mb-8 flex items-center gap-2.5 px-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-purple-600 text-white shadow-lg shadow-brand-600/25">
              <Icon name="sparkles" size={20} />
            </div>
            <div>
              <p className="text-lg font-extrabold leading-none">ClientFlow</p>
              <p className="text-[11px] text-slate-400">Freelancer CRM</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {nav.map((n) => (
              <button
                key={n.key}
                onClick={() => setView(n.key)}
                className={`group relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                  view === n.key
                    ? "bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-lg shadow-brand-600/25"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                <Icon name={n.icon} size={19} />
                {n.label}
              </button>
            ))}
          </nav>

          {installEvent && (
            <button onClick={doInstall} className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-slate-200 dark:bg-white/5 dark:text-brand-300">
              <Icon name="download" size={18} /> Install App
            </button>
          )}

          <button onClick={() => setView("settings")} className="mt-3 flex items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-slate-100 dark:hover:bg-white/5">
            <Avatar label="TN" gradient="linear-gradient(135deg,#6366f1,#a855f7)" size={38} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{data.profile.name}</p>
              <p className="truncate text-xs text-slate-400">{data.profile.role}</p>
            </div>
          </button>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 pb-28 lg:pb-8">
          {/* Top bar */}
          <header className="sticky top-0 z-30 glass border-b border-white/40 px-4 py-3 dark:border-white/5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-500">{title}</p>
                <h2 className="truncate text-lg font-extrabold leading-tight sm:text-xl">
                  Welcome back, <span className="text-gradient">Toyyibah</span> 👋
                </h2>
              </div>

              <button
                onClick={() => setSearchOpen(true)}
                className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white/60 px-3 py-2 text-sm text-slate-400 transition hover:border-brand-300 sm:flex dark:border-white/10 dark:bg-white/5"
              >
                <Icon name="search" size={16} />
                <span>Search…</span>
                <kbd className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-white/10">⌘K</kbd>
              </button>

              <button onClick={() => setSearchOpen(true)} className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white/60 text-slate-500 sm:hidden dark:border-white/10 dark:bg-white/5">
                <Icon name="search" size={18} />
              </button>

              <button onClick={toggleTheme} className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white/60 text-slate-500 transition hover:text-brand-600 dark:border-white/10 dark:bg-white/5 dark:hover:text-brand-300">
                <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
              </button>

              <button onClick={() => setNotifOpen(true)} className="relative grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white/60 text-slate-500 transition hover:text-brand-600 dark:border-white/10 dark:bg-white/5 dark:hover:text-brand-300">
                <Icon name="bell" size={18} />
                {unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#14141f]" />}
              </button>
            </div>
          </header>

          {/* iOS install banner */}
          <AnimatePresence>
            {showIosBanner && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mx-4 mt-4 sm:mx-6">
                <div className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-3.5 dark:border-brand-500/20 dark:bg-brand-500/10">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 text-white">
                    <Icon name="download" size={18} />
                  </span>
                  <p className="flex-1 text-xs text-slate-600 dark:text-slate-300">
                    Install ClientFlow: tap the <span className="font-bold">Share</span> icon, then <span className="font-bold">Add to Home Screen</span>.
                  </p>
                  <button onClick={() => { setShowIosBanner(false); localStorage.setItem("clientflow.ios.dismissed", "1"); }} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/50">
                    <Icon name="close" size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* View */}
          <div className="px-4 py-5 sm:px-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {view === "dashboard" && <Dashboard onNav={setView} />}
                {view === "clients" && <Clients query={query || ""} />}
                {view === "leads" && <Leads query={query || ""} />}
                {view === "quotes" && <Quotes query={query || ""} />}
                {view === "projects" && <Projects query={query || ""} />}
                {view === "invoices" && <Invoices query={query || ""} />}
                {view === "notes" && <Notes query={query || ""} />}
                {view === "calendar" && <Calendar />}
                {view === "settings" && <Settings onInstall={doInstall} canInstall={!!installEvent} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 glass border-t border-white/40 px-2 py-2 lg:hidden dark:border-white/5">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {mobileNav.map((k) => {
            const n = nav.find((x) => x.key === k)!;
            const active = view === k;
            return (
              <button key={k} onClick={() => setView(k)} className="relative flex flex-1 flex-col items-center gap-1 py-1.5">
                {active && <motion.span layoutId="tab" className="absolute -top-2 h-1 w-8 rounded-full bg-gradient-to-r from-brand-600 to-purple-600" />}
                <Icon name={n.icon} size={21} className={active ? "text-brand-600 dark:text-brand-300" : "text-slate-400"} />
                <span className={`text-[10px] font-semibold ${active ? "text-brand-600 dark:text-brand-300" : "text-slate-400"}`}>{n.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Floating action → more nav on mobile */}
      <MobileMore view={view} setView={setView} />

      {/* Global search */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} onNav={(v) => { setView(v); setSearchOpen(false); }} />

      {/* Notifications */}
      <AnimatePresence>
        {notifOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm" onClick={() => setNotifOpen(false)}>
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white dark:border-white/5 dark:bg-[#0f0f18]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-white/5">
                <h3 className="text-lg font-bold">Notifications</h3>
                <div className="flex items-center gap-2">
                  <button onClick={markAllRead} className="text-xs font-semibold text-brand-600 dark:text-brand-300">Mark all read</button>
                  <button onClick={() => setNotifOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5">
                    <Icon name="close" size={18} />
                  </button>
                </div>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {data.notifications.length === 0 && <p className="py-10 text-center text-sm text-slate-400">You&apos;re all caught up 🎉</p>}
                {data.notifications.map((n) => (
                  <div key={n.id} className={`rounded-2xl border p-3.5 ${n.read ? "border-slate-100 dark:border-white/5" : "border-brand-200 bg-brand-50/50 dark:border-brand-500/20 dark:bg-brand-500/10"}`}>
                    <div className="flex items-start gap-2.5">
                      <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${n.kind === "success" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15" : n.kind === "warning" ? "bg-amber-100 text-amber-600 dark:bg-amber-500/15" : "bg-brand-100 text-brand-600 dark:bg-brand-500/15"}`}>
                        <Icon name={n.kind === "success" ? "check" : n.kind === "warning" ? "flag" : "bell"} size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold">{n.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{n.body}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{relativeTime(n.at)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileMore({ view, setView }: { view: NavKey; setView: (v: NavKey) => void }) {
  const [open, setOpen] = useState(false);
  const more: { key: NavKey; label: string; icon: IconName }[] = [
    { key: "quotes", label: "Quotes", icon: "quotes" },
    { key: "projects", label: "Projects", icon: "projects" },
    { key: "notes", label: "Notes", icon: "notes" },
    { key: "calendar", label: "Calendar", icon: "calendar" },
  ];
  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-5 z-30 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-purple-600 text-white shadow-xl shadow-brand-600/30 lg:hidden"
      >
        <Icon name="menu" size={24} />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)}>
            <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} transition={{ type: "spring", damping: 26, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="card w-full rounded-t-3xl p-5">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-white/10" />
              <div className="grid grid-cols-4 gap-3">
                {more.map((m) => (
                  <button key={m.key} onClick={() => { setView(m.key); setOpen(false); }} className={`flex flex-col items-center gap-2 rounded-2xl p-4 ${view === m.key ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300" : "bg-slate-50 text-slate-600 dark:bg-white/5 dark:text-slate-300"}`}>
                    <Icon name={m.icon} size={22} />
                    <span className="text-xs font-semibold">{m.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
