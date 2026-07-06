"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { money, formatDate, initialsOf } from "@/lib/utils";
import {
  Card,
  Badge,
  Button,
  Avatar,
  Modal,
  Field,
  Input,
  Select,
  EmptyState,
} from "../ui";
import { Icon } from "../Icon";
import type { Client, ClientStatus, Priority } from "@/lib/types";

const gradients = [
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#a855f7,#ec4899)",
  "linear-gradient(135deg,#10b981,#22d3ee)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
  "linear-gradient(135deg,#0ea5e9,#6366f1)",
];

const statusTone: Record<ClientStatus, "emerald" | "rose" | "slate" | "sky"> = {
  active: "emerald",
  overdue: "rose",
  completed: "slate",
  prospect: "sky",
};
const priorityTone: Record<Priority, "rose" | "amber" | "slate"> = {
  high: "rose",
  medium: "amber",
  low: "slate",
};

export function Clients({ query }: { query: string }) {
  const { data, addClient, updateClient, removeClient } = useStore();
  const [filter, setFilter] = useState<"all" | ClientStatus>("all");
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Client | null>(null);
  const [editing, setEditing] = useState<Client | null>(null);

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    status: "active" as ClientStatus,
    priority: "medium" as Priority,
    tags: "",
    location: "",
  });

  const filtered = data.clients.filter((c) => {
    const q = query.toLowerCase();
    const matchQ =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q);
    const matchF = filter === "all" || c.status === filter;
    return matchQ && matchF;
  });

  function submit() {
    if (!form.company.trim()) return;
    addClient({
      name: form.name || form.company,
      company: form.company,
      email: form.email,
      phone: form.phone,
      status: form.status,
      priority: form.priority,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      location: form.location,
      avatarColor: gradients[data.clients.length % gradients.length],
      initials: initialsOf(form.company),
    });
    setForm({ name: "", company: "", email: "", phone: "", status: "active", priority: "medium", tags: "", location: "" });
    setOpen(false);
  }

  const filters: { k: "all" | ClientStatus; label: string }[] = [
    { k: "all", label: "All" },
    { k: "active", label: "Active" },
    { k: "overdue", label: "Overdue" },
    { k: "completed", label: "Completed" },
    { k: "prospect", label: "Prospect" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Clients</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{data.clients.length} total relationships</p>
        </div>
        <Button icon="plus" onClick={() => setOpen(true)}>New Client</Button>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === f.k
                ? "bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-md shadow-brand-600/25"
                : "card text-slate-600 dark:text-slate-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="users"
          title="No clients found"
          description="Add your first client to start managing relationships, projects and payments."
          action={<Button icon="plus" onClick={() => setOpen(true)}>Add Client</Button>}
        />
      ) : (
        <motion.div layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((c) => {
              const rev = data.invoices.filter((i) => i.clientId === c.id && i.status === "paid").reduce((s, i) => s + i.amount, 0);
              const open = data.projects.filter((p) => p.clientId === c.id && p.status === "active").length;
              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                >
                  <Card className="p-4">
                    <button onClick={() => setDetail(c)} className="w-full text-left">
                      <div className="flex items-center gap-3">
                        <Avatar label={c.initials} gradient={c.avatarColor} size={48} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold">{c.company}</p>
                          <p className="truncate text-xs text-slate-400">{c.name}</p>
                        </div>
                        <Badge tone={statusTone[c.status]}>{c.status}</Badge>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-white/5">
                          <p className="text-xs text-slate-400">Open Projects</p>
                          <p className="font-bold">{open}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-white/5">
                          <p className="text-xs text-slate-400">Revenue</p>
                          <p className="font-bold">{money(rev, true)}</p>
                        </div>
                      </div>
                      {c.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {c.tags.map((t) => (
                            <Badge key={t} tone="indigo">{t}</Badge>
                          ))}
                          <Badge tone={priorityTone[c.priority]}>{c.priority}</Badge>
                        </div>
                      )}
                    </button>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="New Client">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company"><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Co." /></Field>
          <Field label="Contact name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" /></Field>
          <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@acme.co" /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 ..." /></Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ClientStatus })}>
              <option value="active">Active</option>
              <option value="prospect">Prospect</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </Field>
          <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Country" /></Field>
          <Field label="Tags (comma separated)"><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Design, Retainer" /></Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Create Client</Button>
        </div>
      </Modal>

      {/* Detail modal */}
      <ClientDetail
        client={detail}
        onClose={() => setDetail(null)}
        onEdit={(c) => { setEditing(c); setDetail(null); }}
        onDelete={(id) => { removeClient(id); setDetail(null); }}
      />

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Client">
        {editing && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company"><Input defaultValue={editing.company} onChange={(e) => (editing.company = e.target.value)} /></Field>
            <Field label="Contact name"><Input defaultValue={editing.name} onChange={(e) => (editing.name = e.target.value)} /></Field>
            <Field label="Email"><Input defaultValue={editing.email} onChange={(e) => (editing.email = e.target.value)} /></Field>
            <Field label="Phone"><Input defaultValue={editing.phone} onChange={(e) => (editing.phone = e.target.value)} /></Field>
            <Field label="Status">
              <Select defaultValue={editing.status} onChange={(e) => (editing.status = e.target.value as ClientStatus)}>
                <option value="active">Active</option>
                <option value="prospect">Prospect</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </Select>
            </Field>
            <Field label="Priority">
              <Select defaultValue={editing.priority} onChange={(e) => (editing.priority = e.target.value as Priority)}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </Field>
            <div className="col-span-full mt-2 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={() => { updateClient(editing.id, { ...editing, initials: initialsOf(editing.company) }); setEditing(null); }}>Save</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ClientDetail({
  client,
  onClose,
  onEdit,
  onDelete,
}: {
  client: Client | null;
  onClose: () => void;
  onEdit: (c: Client) => void;
  onDelete: (id: string) => void;
}) {
  const { data } = useStore();
  if (!client) return null;
  const projects = data.projects.filter((p) => p.clientId === client.id);
  const invoices = data.invoices.filter((i) => i.clientId === client.id);
  const notes = data.notes.filter((n) => n.clientId === client.id);

  return (
    <Modal open={!!client} onClose={onClose} title="Client Profile" maxW="max-w-2xl">
      <div className="flex flex-col items-center text-center">
        <Avatar label={client.initials} gradient={client.avatarColor} size={72} rounded="rounded-3xl" />
        <h3 className="mt-3 text-xl font-extrabold">{client.company}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{client.name}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          <Badge tone={statusTone[client.status]}>{client.status}</Badge>
          <Badge tone={priorityTone[client.priority]}>{client.priority} priority</Badge>
          {client.tags.map((t) => <Badge key={t} tone="indigo">{t}</Badge>)}
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <InfoRow icon="mail" label="Email" value={client.email} />
        <InfoRow icon="phone" label="Phone" value={client.phone} />
        {client.website && <InfoRow icon="globe" label="Website" value={client.website} />}
        {client.location && <InfoRow icon="pin" label="Location" value={client.location} />}
      </div>

      {client.notes && (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
          {client.notes}
        </div>
      )}

      <Section title="Project History" empty={projects.length === 0}>
        {projects.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-white/5">
            <div>
              <p className="text-sm font-semibold">{p.name}</p>
              <p className="text-xs text-slate-400">{p.progress}% · {money(p.budget, true)}</p>
            </div>
            <Badge tone={p.status === "active" ? "emerald" : p.status === "completed" ? "slate" : "amber"}>{p.status}</Badge>
          </div>
        ))}
      </Section>

      <Section title="Payment History" empty={invoices.length === 0}>
        {invoices.map((i) => (
          <div key={i.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-white/5">
            <div>
              <p className="text-sm font-semibold">{i.number} · {money(i.amount)}</p>
              <p className="text-xs text-slate-400">Due {formatDate(i.dueAt)}</p>
            </div>
            <Badge tone={i.status === "paid" ? "emerald" : i.status === "overdue" ? "rose" : i.status === "pending" ? "amber" : "slate"}>{i.status}</Badge>
          </div>
        ))}
      </Section>

      <Section title="Meeting Notes" empty={notes.length === 0}>
        {notes.map((n) => (
          <div key={n.id} className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
            <p className="text-sm font-semibold">{n.title}</p>
            <p className="line-clamp-2 text-xs text-slate-400">{n.body}</p>
          </div>
        ))}
      </Section>

      <div className="mt-6 flex justify-between gap-2">
        <Button variant="danger" icon="trash" onClick={() => onDelete(client.id)}>Delete</Button>
        <Button icon="edit" onClick={() => onEdit(client)}>Edit</Button>
      </div>
    </Modal>
  );
}

function InfoRow({ icon, label, value }: { icon: "mail" | "phone" | "globe" | "pin"; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-white/5">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
        <Icon name={icon} size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, children, empty }: { title: string; children: React.ReactNode; empty: boolean }) {
  return (
    <div className="mt-5">
      <h4 className="mb-2 text-sm font-bold">{title}</h4>
      {empty ? (
        <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-400 dark:bg-white/5">No records yet.</p>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </div>
  );
}
