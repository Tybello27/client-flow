"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { money } from "@/lib/utils";
import { Badge, Button, Modal, Field, Input, Select, Progress } from "../ui";
import { Icon } from "../Icon";
import type { Lead, LeadStage } from "@/lib/types";

const stages: { key: LeadStage; label: string; tone: string }[] = [
  { key: "new", label: "New", tone: "from-slate-400 to-slate-500" },
  { key: "contacted", label: "Contacted", tone: "from-sky-400 to-blue-500" },
  { key: "proposal", label: "Proposal Sent", tone: "from-indigo-400 to-brand-500" },
  { key: "negotiation", label: "Negotiation", tone: "from-purple-400 to-fuchsia-500" },
  { key: "won", label: "Won", tone: "from-emerald-400 to-teal-500" },
  { key: "lost", label: "Lost", tone: "from-rose-400 to-pink-500" },
];

const order: LeadStage[] = ["new", "contacted", "proposal", "negotiation", "won", "lost"];

export function Leads({ query }: { query: string }) {
  const { data, addLead, updateLead, removeLead } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", value: "", stage: "new" as LeadStage, source: "" });

  const filtered = data.leads.filter(
    (l) => !query || l.name.toLowerCase().includes(query.toLowerCase()) || l.company.toLowerCase().includes(query.toLowerCase())
  );

  function move(lead: Lead, dir: 1 | -1) {
    const idx = order.indexOf(lead.stage);
    const next = order[Math.max(0, Math.min(order.length - 1, idx + dir))];
    const progressMap: Record<LeadStage, number> = { new: 15, contacted: 40, proposal: 60, negotiation: 80, won: 100, lost: 25 };
    updateLead(lead.id, { stage: next, progress: progressMap[next] });
  }

  function submit() {
    if (!form.name.trim()) return;
    addLead({
      name: form.name,
      company: form.company || form.name,
      value: Number(form.value) || 0,
      stage: form.stage,
      progress: { new: 15, contacted: 40, proposal: 60, negotiation: 80, won: 100, lost: 25 }[form.stage],
      source: form.source,
    });
    setForm({ name: "", company: "", value: "", stage: "new", source: "" });
    setOpen(false);
  }

  const pipelineValue = data.leads.filter((l) => l.stage !== "lost").reduce((s, l) => s + l.value, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Leads</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pipeline value <span className="font-bold text-brand-600 dark:text-brand-300">{money(pipelineValue, true)}</span>
          </p>
        </div>
        <Button icon="plus" onClick={() => setOpen(true)}>New Lead</Button>
      </div>

      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4">
        {stages.map((s) => {
          const items = filtered.filter((l) => l.stage === s.key);
          return (
            <div key={s.key} className="w-72 shrink-0">
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-br ${s.tone}`} />
                  <span className="text-sm font-bold">{s.label}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-300">
                    {items.length}
                  </span>
                </div>
              </div>
              <div className="space-y-3 rounded-3xl bg-slate-100/60 p-3 dark:bg-white/[0.03]">
                <AnimatePresence>
                  {items.map((l) => (
                    <motion.div
                      key={l.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="card group rounded-2xl p-3.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{l.name}</p>
                          <p className="truncate text-xs text-slate-400">{l.company}</p>
                        </div>
                        <button onClick={() => removeLead(l.id)} className="opacity-0 transition group-hover:opacity-100 text-slate-300 hover:text-rose-500">
                          <Icon name="trash" size={15} />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-gradient">{money(l.value, true)}</span>
                        {l.source && <Badge tone="slate">{l.source}</Badge>}
                      </div>
                      <div className="mt-2.5">
                        <Progress value={l.progress} tone={l.stage === "won" ? "emerald" : l.stage === "lost" ? "rose" : "brand"} />
                        <p className="mt-1 text-[11px] font-medium text-slate-400">{l.progress}% progress</p>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <button
                          onClick={() => move(l, -1)}
                          disabled={order.indexOf(l.stage) === 0}
                          className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-white/10"
                        >
                          <Icon name="chevronLeft" size={15} />
                        </button>
                        <button
                          onClick={() => move(l, 1)}
                          disabled={order.indexOf(l.stage) === order.length - 1}
                          className="grid h-7 w-7 place-items-center rounded-lg text-brand-500 transition hover:bg-brand-50 disabled:opacity-30 dark:hover:bg-white/10"
                        >
                          <Icon name="chevronRight" size={15} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <button
                  onClick={() => { setForm({ ...form, stage: s.key }); setOpen(true); }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-300 py-2.5 text-xs font-semibold text-slate-400 transition hover:border-brand-400 hover:text-brand-500 dark:border-white/10"
                >
                  <Icon name="plus" size={14} /> Add lead
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New Lead">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Lead / Contact name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Northwind Labs" /></Field>
          <Field label="Company"><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Northwind" /></Field>
          <Field label="Deal value ($)"><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="8000" /></Field>
          <Field label="Stage">
            <Select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as LeadStage })}>
              {stages.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </Select>
          </Field>
          <Field label="Source"><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Referral" /></Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Add Lead</Button>
        </div>
      </Modal>
    </div>
  );
}
