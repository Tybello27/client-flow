"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { formatDate, relativeTime, uid } from "@/lib/utils";
import { Card, Badge, Button, Modal, Field, Input, Select, Textarea, EmptyState } from "../ui";
import { Icon } from "../Icon";
import type { Note } from "@/lib/types";

export function Notes({ query }: { query: string }) {
  const { data, addNote, updateNote, removeNote } = useStore();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Note | null>(null);
  const [form, setForm] = useState({ title: "", clientId: data.clients[0]?.id ?? "", body: "", followUpDays: "", attachments: "" });

  const filtered = data.notes.filter((n) => {
    const client = data.clients.find((c) => c.id === n.clientId);
    const s = `${n.title} ${n.body} ${client?.company ?? ""}`.toLowerCase();
    return !query || s.includes(query.toLowerCase());
  });

  function submit() {
    if (!form.title.trim()) return;
    addNote({
      title: form.title,
      clientId: form.clientId,
      body: form.body,
      followUpAt: form.followUpDays ? Date.now() + Number(form.followUpDays) * 86400000 : undefined,
      attachments: form.attachments ? form.attachments.split(",").map((a) => a.trim()).filter(Boolean) : [],
      actionItems: [],
    });
    setForm({ title: "", clientId: data.clients[0]?.id ?? "", body: "", followUpDays: "", attachments: "" });
    setOpen(false);
  }

  function toggleAction(note: Note, aid: string) {
    const actionItems = note.actionItems.map((a) => a.id === aid ? { ...a, done: !a.done } : a);
    updateNote(note.id, { actionItems });
    setDetail({ ...note, actionItems });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Meeting Notes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{data.notes.length} notes captured</p>
        </div>
        <Button icon="plus" onClick={() => setOpen(true)}>New Note</Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="notes" title="No notes yet" description="Capture meeting notes, action items and follow-up reminders." action={<Button icon="plus" onClick={() => setOpen(true)}>Add Note</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((n) => {
              const client = data.clients.find((c) => c.id === n.clientId);
              const openActions = n.actionItems.filter((a) => !a.done).length;
              return (
                <motion.div key={n.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <Card className="flex h-full flex-col p-4">
                    <button onClick={() => setDetail(n)} className="flex-1 text-left">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold">{n.title}</p>
                        <Icon name="notes" size={16} className="shrink-0 text-brand-400" />
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">{client?.company} · {relativeTime(n.createdAt)}</p>
                      <p className="mt-2 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">{n.body}</p>
                    </button>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {n.followUpAt && <Badge tone="amber"><Icon name="clock" size={11} /> {formatDate(n.followUpAt)}</Badge>}
                      {openActions > 0 && <Badge tone="indigo">{openActions} action{openActions > 1 ? "s" : ""}</Badge>}
                      {n.attachments.length > 0 && <Badge tone="slate"><Icon name="paperclip" size={11} /> {n.attachments.length}</Badge>}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add */}
      <Modal open={open} onClose={() => setOpen(false)} title="New Meeting Note">
        <div className="space-y-4">
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Kickoff call" /></Field>
          <Field label="Client">
            <Select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
              {data.clients.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}
            </Select>
          </Field>
          <Field label="Notes"><Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="What was discussed..." /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Follow-up in (days)"><Input type="number" value={form.followUpDays} onChange={(e) => setForm({ ...form, followUpDays: e.target.value })} placeholder="3" /></Field>
            <Field label="Attachments (comma separated)"><Input value={form.attachments} onChange={(e) => setForm({ ...form, attachments: e.target.value })} placeholder="deck.pdf" /></Field>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Save Note</Button>
        </div>
      </Modal>

      {/* Detail */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.title ?? ""} maxW="max-w-lg">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge tone="indigo">{data.clients.find((c) => c.id === detail.clientId)?.company}</Badge>
              <span className="text-xs text-slate-400">{relativeTime(detail.createdAt)}</span>
            </div>
            <p className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed dark:bg-white/5">{detail.body}</p>

            {detail.followUpAt && (
              <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                <Icon name="clock" size={16} /> Follow-up {formatDate(detail.followUpAt, { month: "long", day: "numeric" })}
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-bold">Action Items</h4>
                <AddAction onAdd={(text) => {
                  const actionItems = [...detail.actionItems, { id: uid("a"), text, done: false }];
                  updateNote(detail.id, { actionItems });
                  setDetail({ ...detail, actionItems });
                }} />
              </div>
              {detail.actionItems.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-400 dark:bg-white/5">No action items.</p>
              ) : (
                <div className="space-y-1.5">
                  {detail.actionItems.map((a) => (
                    <button key={a.id} onClick={() => toggleAction(detail, a.id)} className="flex w-full items-center gap-3 rounded-xl bg-slate-50 p-2.5 text-left dark:bg-white/5">
                      <span className={`grid h-5 w-5 place-items-center rounded-md border transition ${a.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 dark:border-white/20"}`}>
                        {a.done && <Icon name="check" size={12} />}
                      </span>
                      <span className={`text-sm ${a.done ? "text-slate-400 line-through" : "font-medium"}`}>{a.text}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {detail.attachments.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-bold">Attachments</h4>
                <div className="flex flex-wrap gap-2">
                  {detail.attachments.map((f) => (
                    <span key={f} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium dark:bg-white/5">
                      <Icon name="paperclip" size={13} className="text-brand-500" /> {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="danger" icon="trash" onClick={() => { removeNote(detail.id); setDetail(null); }}>Delete Note</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function AddAction({ onAdd }: { onAdd: (text: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-1.5">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) { onAdd(val.trim()); setVal(""); } }}
        placeholder="Add task"
        className="w-36 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs outline-none focus:border-brand-400 dark:border-white/10 dark:bg-white/5"
      />
      <button onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(""); } }} className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
        <Icon name="plus" size={14} />
      </button>
    </div>
  );
}
