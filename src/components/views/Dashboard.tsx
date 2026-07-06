"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { getMetrics, revenueSeries, projectSeries } from "@/lib/metrics";
import { money, relativeTime, formatDate } from "@/lib/utils";
import { Card, Badge, Sparkline, AreaChart, BarChart, Avatar } from "../ui";
import { Icon, type IconName } from "../Icon";
import type { NavKey } from "../App";
import type { ActivityType } from "@/lib/types";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

const activityIcon: Record<ActivityType, IconName> = {
  client: "users",
  invoice: "invoices",
  project: "projects",
  quote: "quotes",
  lead: "leads",
  note: "notes",
};
const activityTone: Record<ActivityType, string> = {
  client: "from-brand-500 to-purple-500",
  invoice: "from-emerald-500 to-teal-400",
  project: "from-sky-500 to-indigo-500",
  quote: "from-purple-500 to-pink-500",
  lead: "from-amber-500 to-orange-400",
  note: "from-slate-500 to-slate-400",
};

export function Dashboard({ onNav }: { onNav: (k: NavKey) => void }) {
  const { data } = useStore();
  const m = getMetrics(data);
  const rev = revenueSeries(data);
  const proj = projectSeries(data);

  const kpis: {
    label: string;
    value: string;
    delta: string;
    up: boolean;
    icon: IconName;
    tone: "brand" | "emerald" | "rose";
    grad: string;
  }[] = [
    { label: "Total Clients", value: String(m.totalClients), delta: "+27.8%", up: true, icon: "users", tone: "brand", grad: "from-brand-500 to-purple-500" },
    { label: "Active Projects", value: String(m.activeProjects), delta: "+3.1%", up: true, icon: "projects", tone: "brand", grad: "from-sky-500 to-indigo-500" },
    { label: "Monthly Revenue", value: money(m.monthlyRevenue, true), delta: "+12.4%", up: true, icon: "money", tone: "emerald", grad: "from-emerald-500 to-teal-400" },
    { label: "Outstanding", value: money(m.outstanding, true), delta: "-2.6%", up: false, icon: "invoices", tone: "rose", grad: "from-amber-500 to-orange-400" },
    { label: "Pending Quotes", value: String(m.pendingQuotes), delta: "+2", up: true, icon: "quotes", tone: "brand", grad: "from-purple-500 to-pink-500" },
    { label: "Meetings", value: String(m.upcomingMeetings), delta: "This week", up: true, icon: "calendar", tone: "brand", grad: "from-fuchsia-500 to-purple-500" },
  ];

  const quickActions: { label: string; icon: IconName; to: NavKey }[] = [
    { label: "New Client", icon: "users", to: "clients" },
    { label: "New Project", icon: "projects", to: "projects" },
    { label: "New Quote", icon: "quotes", to: "quotes" },
    { label: "New Invoice", icon: "invoices", to: "invoices" },
  ];

  const upcoming = [...data.events]
    .filter((e) => e.date >= Date.now() - 86400000)
    .sort((a, b) => a.date - b.date)
    .slice(0, 4);

  const eventTone: Record<string, "indigo" | "emerald" | "amber" | "purple"> = {
    meeting: "indigo",
    deadline: "amber",
    invoice: "emerald",
    milestone: "purple",
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Hero greeting */}
      <motion.div variants={item}>
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-brand-500/20 to-purple-500/20 blur-2xl" />
          <div className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-400/15 to-teal-400/10 blur-2xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Badge tone="indigo" dot>Dashboard overview</Badge>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Welcome back, <span className="text-gradient">Toyyibah</span> 👋
              </h1>
              <p className="mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400">
                Here&apos;s what&apos;s happening across your freelance business today.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-purple-600 p-4 text-white shadow-lg shadow-brand-600/25">
                <p className="text-xs font-medium text-white/80">Total Revenue</p>
                <p className="text-2xl font-extrabold">{money(m.totalRevenue, true)}</p>
                <div className="mt-1 opacity-90">
                  <Sparkline data={rev} tone="emerald" height={26} />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((a) => (
          <button
            key={a.label}
            onClick={() => onNav(a.to)}
            className="card group flex items-center gap-3 rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500/10 to-purple-500/10 text-brand-600 transition group-hover:from-brand-500 group-hover:to-purple-500 group-hover:text-white dark:text-brand-300">
              <Icon name={a.icon} size={18} />
            </span>
            <span className="text-sm font-semibold">{a.label}</span>
          </button>
        ))}
      </motion.div>

      {/* KPI grid */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4">
            <div className="flex items-start justify-between">
              <span className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${k.grad} text-white`}>
                <Icon name={k.icon} size={16} />
              </span>
              <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${k.up ? "text-emerald-500" : "text-rose-500"}`}>
                <Icon name={k.up ? "arrowUp" : "arrowDown"} size={12} />
                {k.delta}
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold tracking-tight">{k.value}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{k.label}</p>
            <div className="mt-2 -mb-1">
              <Sparkline data={rev.map((v, i) => v * (0.6 + (i % 3) * 0.2))} tone={k.tone} height={26} />
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-5">
        <motion.div variants={item} className="lg:col-span-3">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Revenue Growth</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Last 7 weeks</p>
              </div>
              <Badge tone="emerald" dot>+18.2%</Badge>
            </div>
            <AreaChart data={rev} height={180} labels={["W1", "W2", "W3", "W4", "W5", "W6", "W7"]} />
          </Card>
        </motion.div>
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="p-5">
            <div className="mb-4">
              <h2 className="text-base font-bold">Projects Delivered</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly output</p>
            </div>
            <BarChart data={proj} labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]} height={180} />
          </Card>
        </motion.div>
      </div>

      {/* Activity + Upcoming */}
      <div className="grid gap-5 lg:grid-cols-5">
        <motion.div variants={item} className="lg:col-span-3">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold">Recent Activity</h2>
              <button onClick={() => onNav("clients")} className="text-xs font-semibold text-brand-600 dark:text-brand-300">
                See all
              </button>
            </div>
            <div className="relative space-y-1">
              {data.activities.slice(0, 6).map((a, i) => (
                <div key={a.id} className="flex items-start gap-3 rounded-2xl p-2 transition hover:bg-slate-50 dark:hover:bg-white/5">
                  <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${activityTone[a.type]} text-white`}>
                    <Icon name={activityIcon[a.type]} size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.text}</p>
                    <p className="text-xs text-slate-400">{relativeTime(a.at)}</p>
                  </div>
                  {i === 0 && <Badge tone="emerald">New</Badge>}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-2">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold">Upcoming</h2>
              <button onClick={() => onNav("calendar")} className="text-xs font-semibold text-brand-600 dark:text-brand-300">
                Calendar
              </button>
            </div>
            <div className="space-y-2.5">
              {upcoming.map((e) => {
                const client = data.clients.find((c) => c.id === e.clientId);
                return (
                  <div key={e.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-center dark:bg-white/10">
                      <span className="text-xs font-bold leading-none text-brand-600 dark:text-brand-300">
                        {formatDate(e.date, { month: "short" }).toUpperCase()}
                      </span>
                      <span className="text-sm font-extrabold leading-none">
                        {new Date(e.date).getDate()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{e.title}</p>
                      {client && <p className="truncate text-xs text-slate-400">{client.company}</p>}
                    </div>
                    <Badge tone={eventTone[e.type]}>{e.type}</Badge>
                  </div>
                );
              })}
              {upcoming.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">Nothing scheduled.</p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Client overview */}
      <motion.div variants={item}>
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold">Top Clients</h2>
            <button onClick={() => onNav("clients")} className="text-xs font-semibold text-brand-600 dark:text-brand-300">
              View all
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.clients.slice(0, 3).map((c) => {
              const rev = data.invoices
                .filter((i) => i.clientId === c.id && i.status === "paid")
                .reduce((s, i) => s + i.amount, 0);
              const open = data.projects.filter((p) => p.clientId === c.id && p.status === "active").length;
              return (
                <button
                  key={c.id}
                  onClick={() => onNav("clients")}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/5"
                >
                  <Avatar label={c.initials} gradient={c.avatarColor} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{c.company}</p>
                    <p className="text-xs text-slate-400">{open} open · {money(rev, true)}</p>
                  </div>
                  <Badge tone={c.status === "active" ? "emerald" : c.status === "overdue" ? "rose" : "slate"}>
                    {c.status}
                  </Badge>
                </button>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
