"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { money, formatDate, relativeTime, clamp } from "@/lib/utils";
import { Card, Badge, Button, Modal, Field, Input, Select, Progress, EmptyState, Avatar } from "../ui";
import { Icon } from "../Icon";
import type { Project, ProjectStatus, Priority } from "@/lib/types";

const statusTone: Record<ProjectStatus, "emerald" | "amber" | "slate"> = {
  active: "emerald",
  "on-hold": "amber",
  completed: "slate",
};
const priorityTone: Record<Priority, "rose" | "amber" | "slate"> = {
  high: "rose",
  medium: "amber",
  low: "slate",
};

export function Projects({ query }: { query: string }) {
  const { data, addProject, updateProject, removeProject } = useStore();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Project | null>(null);
  const [form, setForm] = useState({
    name: "",
    clientId: data.clients[0]?.id ?? "",
    budget: "",
    priority: "medium" as Priority,
    deadlineDays: "30",
  });

  const filtered = data.projects.filter((p) => {
    const client = data.clients.find((c) => c.id === p.clientId);
    const s = `${p.name} ${client?.company ?? ""}`.toLowerCase();
    return !query || s.includes(query.toLowerCase());
  });

  function submit() {
    if (!form.name.trim()) return;
    addProject({
      name: form.name,
      clientId: form.clientId,
      status: "active",
      priority: form.priority,
      progress: 0,
      budget: Number(form.budget) || 0,
      deadline: Date.now() + (Number(form.deadlineDays) || 30) * 86400000,
      milestones: [],
    });
    setForm({ name: "", clientId: data.clients[0]?.id ?? "", budget: "", priority: "medium", deadlineDays: "30" });
    setOpen(false);
  }

  function toggleMilestone(project: Project, mid: string) {
    const milestones = project.milestones.map((m) => m.id === mid ? { ...m, done: !m.done } : m);
    const progress = milestones.length ? Math.round((milestones.filter((m) => m.done).length / milestones.length) * 100) : project.progress;
    updateProject(project.id, { milestones, progress, status: progress === 100 ? "completed" : project.status });
    setDetail({ ...project, milestones, progress });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{data.projects.filter((p) => p.status === "active").length} active projects</p>
        </div>
        <Button icon="plus" onClick={() => setOpen(true)}>New Project</Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="projects" title="No projects" description="Track milestones, budgets and deadlines for every engagement." action={<Button icon="plus" onClick={() => setOpen(true)}>Create Project</Button>} />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          <AnimatePresence>
            {filtered.map((p) => {
              const client = data.clients.find((c) => c.id === p.clientId);
              const done = p.milestones.filter((m) => m.done).length;
              const overdue = p.deadline < Date.now() && p.status !== "completed";
              return (
                <motion.div key={p.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <Card className="p-5">
                    <button onClick={() => setDetail(p)} className="w-full text-left">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {client && <Avatar label={client.initials} gradient={client.avatarColor} size={44} />}
                          <div>
                            <p className="font-bold">{p.name}</p>
                            <p className="text-xs text-slate-400">{client?.company}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <Badge tone={statusTone[p.status]}>{p.status}</Badge>
                          <Badge tone={priorityTone[p.priority]}>{p.priority}</Badge>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="font-semibold">{p.progress}% complete</span>
                          <span className={overdue ? "font-semibold text-rose-500" : "text-slate-400"}>
                            {overdue ? "Overdue" : `Due ${formatDate(p.deadline)}`}
                          </span>
                        </div>
                        <Progress value={p.progress} tone={p.progress === 100 ? "emerald" : overdue ? "rose" : "brand"} />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-white/5">
                          <Icon name="money" size={15} className="text-emerald-500" />
                          <div>
                            <p className="text-[10px] text-slate-400">Budget</p>
                            <p className="text-sm font-bold">{money(p.budget, true)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-white/5">
                          <Icon name="target" size={15} className="text-brand-500" />
                          <div>
                            <p className="text-[10px] text-slate-400">Milestones</p>
                            <p className="text-sm font-bold">{done}/{p.milestones.length}</p>
                          </div>
                        </div>
                      </div>
                    </button>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add */}
      <Modal open={open} onClose={() => setOpen(false)} title="New Project">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Brand System" /></Field>
          <Field label="Client">
            <Select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
              {data.clients.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}
            </Select>
          </Field>
          <Field label="Budget ($)"><Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="12000" /></Field>
          <Field label="Priority">
            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </Field>
          <Field label="Deadline (days from now)"><Input type="number" value={form.deadlineDays} onChange={(e) => setForm({ ...form, deadlineDays: e.target.value })} /></Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Create Project</Button>
        </div>
      </Modal>

      {/* Detail */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name ?? ""} maxW="max-w-lg">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge tone={statusTone[detail.status]}>{detail.status}</Badge>
              <Badge tone={priorityTone[detail.priority]}>{detail.priority} priority</Badge>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-semibold">{detail.progress}% complete</span>
                <span className="text-slate-400">Due {relativeTime(detail.deadline)}</span>
              </div>
              <Progress value={detail.progress} tone={detail.progress === 100 ? "emerald" : "brand"} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                <p className="text-xs text-slate-400">Budget</p>
                <p className="font-bold">{money(detail.budget)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                <p className="text-xs text-slate-400">Deadline</p>
                <p className="font-bold">{formatDate(detail.deadline, { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-bold">Milestones</h4>
                <AddMilestone project={detail} onAdd={(title) => {
                  const milestones = [...detail.milestones, { id: `m_${Date.now()}`, title, done: false }];
                  const progress = Math.round((milestones.filter((m) => m.done).length / milestones.length) * 100);
                  updateProject(detail.id, { milestones });
                  setDetail({ ...detail, milestones, progress });
                }} />
              </div>
              {detail.milestones.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-400 dark:bg-white/5">No milestones yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {detail.milestones.map((m) => (
                    <button key={m.id} onClick={() => toggleMilestone(detail, m.id)} className="flex w-full items-center gap-3 rounded-xl bg-slate-50 p-2.5 text-left dark:bg-white/5">
                      <span className={`grid h-5 w-5 place-items-center rounded-md border transition ${m.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 dark:border-white/20"}`}>
                        {m.done && <Icon name="check" size={12} />}
                      </span>
                      <span className={`text-sm ${m.done ? "text-slate-400 line-through" : "font-medium"}`}>{m.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <Button variant="danger" icon="trash" onClick={() => { removeProject(detail.id); setDetail(null); }}>Delete</Button>
              {detail.status !== "completed" && (
                <Button icon="check" onClick={() => { updateProject(detail.id, { status: "completed", progress: 100 }); setDetail(null); }}>Mark Complete</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function AddMilestone({ project, onAdd }: { project: Project; onAdd: (title: string) => void }) {
  const [val, setVal] = useState("");
  void clamp;
  return (
    <div className="flex gap-1.5">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) { onAdd(val.trim()); setVal(""); } }}
        placeholder="Add milestone"
        className="w-40 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs outline-none focus:border-brand-400 dark:border-white/10 dark:bg-white/5"
      />
      <button
        onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(""); } }}
        className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"
      >
        <Icon name="plus" size={14} />
      </button>
    </div>
  );
}
