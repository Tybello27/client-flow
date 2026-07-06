"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { Card, Badge, Button, Modal, Field, Input, Select } from "../ui";
import { Icon } from "../Icon";
import type { EventType } from "@/lib/types";

const typeTone: Record<EventType, "indigo" | "amber" | "emerald" | "purple"> = {
  meeting: "indigo",
  deadline: "amber",
  invoice: "emerald",
  milestone: "purple",
};
const typeColor: Record<EventType, string> = {
  meeting: "bg-brand-500",
  deadline: "bg-amber-500",
  invoice: "bg-emerald-500",
  milestone: "bg-purple-500",
};

export function Calendar() {
  const { data, addEvent, removeEvent } = useStore();
  const [cursor, setCursor] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", type: "meeting" as EventType, clientId: "", dateOffset: "" });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = useMemo(() => {
    const arr: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [firstDay, daysInMonth]);

  function eventsForDay(day: number) {
    return data.events.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  const monthName = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const today = new Date();
  const isToday = (d: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  const selectedEvents = selected ? eventsForDay(selected) : [];

  function submit() {
    if (!form.title.trim()) return;
    const baseDay = selected ?? today.getDate();
    const date = new Date(year, month, baseDay).getTime() + (Number(form.dateOffset) || 0) * 86400000;
    addEvent({ title: form.title, type: form.type, clientId: form.clientId || undefined, date });
    setForm({ title: "", type: "meeting", clientId: "", dateOffset: "" });
    setOpen(false);
  }

  const upcoming = [...data.events].filter((e) => e.date >= Date.now() - 86400000).sort((a, b) => a.date - b.date).slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Calendar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Meetings, deadlines, invoices &amp; milestones</p>
        </div>
        <Button icon="plus" onClick={() => setOpen(true)}>New Event</Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">{monthName}</h2>
            <div className="flex gap-1">
              <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5">
                <Icon name="chevronLeft" size={18} />
              </button>
              <button onClick={() => setCursor(new Date())} className="rounded-xl px-3 text-sm font-semibold text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-white/5">Today</button>
              <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5">
                <Icon name="chevronRight" size={18} />
              </button>
            </div>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <div key={d} className="py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (d === null) return <div key={i} />;
              const evs = eventsForDay(d);
              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.04 }}
                  onClick={() => setSelected(d)}
                  className={`relative flex aspect-square flex-col items-center justify-start rounded-xl p-1.5 text-sm transition ${
                    isToday(d)
                      ? "bg-gradient-to-br from-brand-600 to-purple-600 font-bold text-white shadow-md shadow-brand-600/25"
                      : selected === d
                      ? "bg-brand-50 font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                      : "hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <span>{d}</span>
                  {evs.length > 0 && (
                    <div className="mt-auto flex gap-0.5">
                      {evs.slice(0, 3).map((e) => (
                        <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${isToday(d) ? "bg-white" : typeColor[e.type]}`} />
                      ))}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-3 text-xs dark:border-white/5">
            {(["meeting", "deadline", "invoice", "milestone"] as EventType[]).map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className={`h-2 w-2 rounded-full ${typeColor[t]}`} /> {t}
              </span>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          {selected && (
            <Card className="p-5">
              <h3 className="mb-3 text-sm font-bold">{formatDate(new Date(year, month, selected).getTime(), { weekday: "long", month: "long", day: "numeric" })}</h3>
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-slate-400">No events. Tap New Event to add one.</p>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map((e) => (
                    <div key={e.id} className="group flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-white/5">
                      <span className={`h-2.5 w-2.5 rounded-full ${typeColor[e.type]}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{e.title}</p>
                        <p className="text-xs text-slate-400">{data.clients.find((c) => c.id === e.clientId)?.company ?? e.type}</p>
                      </div>
                      <button onClick={() => removeEvent(e.id)} className="text-slate-300 opacity-0 transition hover:text-rose-500 group-hover:opacity-100">
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          <Card className="p-5">
            <h3 className="mb-3 text-sm font-bold">Upcoming</h3>
            <div className="space-y-2">
              {upcoming.map((e) => (
                <div key={e.id} className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-center dark:bg-white/5">
                    <span className="text-[10px] font-bold leading-none text-slate-400">{formatDate(e.date, { month: "short" }).toUpperCase()}</span>
                    <span className="text-sm font-extrabold leading-none">{new Date(e.date).getDate()}</span>
                  </div>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">{e.title}</p>
                  <Badge tone={typeTone[e.type]}>{e.type}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New Event">
        <div className="space-y-4">
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Client call" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as EventType })}>
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="invoice">Invoice</option>
                <option value="milestone">Milestone</option>
              </Select>
            </Field>
            <Field label="Client (optional)">
              <Select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                <option value="">None</option>
                {data.clients.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Days from selected/today"><Input type="number" value={form.dateOffset} onChange={(e) => setForm({ ...form, dateOffset: e.target.value })} placeholder="0" /></Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Add Event</Button>
        </div>
      </Modal>
    </div>
  );
}
