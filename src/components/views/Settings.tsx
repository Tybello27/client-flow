"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { getMetrics } from "@/lib/metrics";
import { money, initialsOf } from "@/lib/utils";
import { Card, Badge, Button, Avatar, Field, Input } from "../ui";
import { Icon, type IconName } from "../Icon";

export function Settings({ onInstall, canInstall }: { onInstall: () => void; canInstall: boolean }) {
  const { data, theme, toggleTheme, updateProfile, resetData } = useStore();
  const m = getMetrics(data);
  const p = data.profile;
  const [name, setName] = useState(p.name);
  const [email, setEmail] = useState(p.email);
  const [business, setBusiness] = useState(p.business);
  const [saved, setSaved] = useState(false);

  const [prefs, setPrefs] = useState({ email: true, push: true, invoices: true, digest: false });

  function save() {
    updateProfile({ name, email, business });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  const rows: { icon: IconName; label: string; desc: string }[] = [
    { icon: "settings", label: "Account Settings", desc: "Manage your personal details" },
    { icon: "briefcase", label: "Business Settings", desc: "Company info & invoicing" },
    { icon: "shield", label: "Privacy & Security", desc: "Data stored locally on device" },
    { icon: "help", label: "Help & Support", desc: "Guides and contact" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Profile header */}
      <Card className="relative overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-brand-600 via-purple-600 to-brand-500" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex items-end gap-4">
            <Avatar label={initialsOf(p.name)} gradient="linear-gradient(135deg,#6366f1,#a855f7)" size={80} rounded="rounded-3xl" />
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold">{p.name}</h1>
                <Badge tone="purple"><Icon name="sparkles" size={12} /> {p.role}</Badge>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{p.email}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-slate-50 py-4 text-center dark:divide-white/5 dark:bg-white/5">
            <div>
              <p className="text-lg font-extrabold text-gradient">{m.wonLeads}</p>
              <p className="text-xs text-slate-400">Deals Won</p>
            </div>
            <div>
              <p className="text-lg font-extrabold text-gradient">{money(m.totalRevenue, true)}</p>
              <p className="text-xs text-slate-400">Revenue</p>
            </div>
            <div>
              <p className="text-lg font-extrabold text-gradient">{m.totalClients}</p>
              <p className="text-xs text-slate-400">Clients</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Install PWA */}
      {canInstall && (
        <Card className="flex items-center gap-4 p-5">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 text-white">
            <Icon name="download" size={22} />
          </span>
          <div className="flex-1">
            <p className="font-bold">Install ClientFlow</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Add to your home screen for a native app experience.</p>
          </div>
          <Button onClick={onInstall}>Install</Button>
        </Card>
      )}

      {/* Edit profile */}
      <Card className="p-6">
        <h2 className="mb-4 text-base font-bold">Edit Profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Email"><Input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="Business name"><Input value={business} onChange={(e) => setBusiness(e.target.value)} /></Field>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={save}>Save Changes</Button>
          {saved && <span className="flex items-center gap-1 text-sm font-semibold text-emerald-500"><Icon name="check" size={16} /> Saved</span>}
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-6">
        <h2 className="mb-4 text-base font-bold">Appearance</h2>
        <button onClick={toggleTheme} className="flex w-full items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-brand-600 dark:bg-white/10 dark:text-brand-300">
              <Icon name={theme === "dark" ? "moon" : "sun"} size={18} />
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold">Dark Mode</p>
              <p className="text-xs text-slate-400">{theme === "dark" ? "On" : "Off"}</p>
            </div>
          </div>
          <span className={`relative h-7 w-12 rounded-full transition ${theme === "dark" ? "bg-brand-600" : "bg-slate-300"}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${theme === "dark" ? "left-6" : "left-1"}`} />
          </span>
        </button>
      </Card>

      {/* Notification prefs */}
      <Card className="p-6">
        <h2 className="mb-4 text-base font-bold">Notification Preferences</h2>
        <div className="space-y-1">
          {([
            ["email", "Email notifications"],
            ["push", "Push notifications"],
            ["invoices", "Invoice reminders"],
            ["digest", "Weekly digest"],
          ] as const).map(([key, label]) => (
            <button key={key} onClick={() => setPrefs({ ...prefs, [key]: !prefs[key] })} className="flex w-full items-center justify-between rounded-xl p-3 transition hover:bg-slate-50 dark:hover:bg-white/5">
              <span className="text-sm font-medium">{label}</span>
              <span className={`relative h-6 w-11 rounded-full transition ${prefs[key] ? "bg-brand-600" : "bg-slate-300 dark:bg-white/10"}`}>
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${prefs[key] ? "left-6" : "left-1"}`} />
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Menu rows */}
      <Card className="divide-y divide-slate-100 overflow-hidden dark:divide-white/5">
        {rows.map((r) => (
          <button key={r.label} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-slate-50 dark:hover:bg-white/5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
              <Icon name={r.icon} size={18} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{r.label}</p>
              <p className="text-xs text-slate-400">{r.desc}</p>
            </div>
            <Icon name="chevronRight" size={18} className="text-slate-300" />
          </button>
        ))}
      </Card>

      {/* Danger */}
      <Card className="p-6">
        <h2 className="mb-1 text-base font-bold">Reset Data</h2>
        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">Restore the demo dataset. This clears your local changes.</p>
        <Button variant="danger" icon="trash" onClick={() => { if (confirm("Reset all data to demo defaults?")) resetData(); }}>Reset to Demo Data</Button>
      </Card>

      <p className="pb-4 text-center text-xs text-slate-400">ClientFlow · Freelancer CRM · v1.0 · Made for Toyyibah</p>
    </div>
  );
}
