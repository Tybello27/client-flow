"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { money, formatDate, quoteTotal, uid } from "@/lib/utils";
import { Card, Badge, Button, Modal, Field, Input, Select, EmptyState } from "../ui";
import { Icon } from "../Icon";
import type { Quote, QuoteStatus, QuoteItem } from "@/lib/types";

const statusTone: Record<QuoteStatus, "slate" | "sky" | "purple" | "emerald" | "rose"> = {
  draft: "slate",
  sent: "sky",
  viewed: "purple",
  accepted: "emerald",
  rejected: "rose",
};

const flow: QuoteStatus[] = ["draft", "sent", "viewed", "accepted"];

export function Quotes({ query }: { query: string }) {
  const { data, addQuote, updateQuote, removeQuote } = useStore();
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState(data.clients[0]?.id ?? "");
  const [items, setItems] = useState<QuoteItem[]>([{ id: uid("qi"), label: "", qty: 1, price: 0 }]);

  const filtered = data.quotes.filter((q) => {
    const client = data.clients.find((c) => c.id === q.clientId);
    const s = `${q.number} ${client?.company ?? ""}`.toLowerCase();
    return !query || s.includes(query.toLowerCase());
  });

  function advance(q: Quote) {
    const idx = flow.indexOf(q.status);
    if (idx >= 0 && idx < flow.length - 1) updateQuote(q.id, { status: flow[idx + 1] });
  }

  function submit() {
    if (!clientId) return;
    const clean = items.filter((i) => i.label.trim());
    if (clean.length === 0) return;
    const num = `QT-${1046 + data.quotes.length}`;
    addQuote({
      number: num,
      clientId,
      status: "draft",
      items: clean,
      validUntil: Date.now() + 30 * 86400000,
    });
    setItems([{ id: uid("qi"), label: "", qty: 1, price: 0 }]);
    setOpen(false);
  }

  const totalPipeline = filtered.reduce((s, q) => s + quoteTotal(q.items), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Quotes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filtered.length} quotes · {money(totalPipeline, true)} total
          </p>
        </div>
        <Button icon="plus" onClick={() => setOpen(true)}>New Quote</Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="quotes" title="No quotes yet" description="Create polished quotations and track them from draft to accepted." action={<Button icon="plus" onClick={() => setOpen(true)}>Create Quote</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((q) => {
              const client = data.clients.find((c) => c.id === q.clientId);
              const total = quoteTotal(q.items);
              return (
                <motion.div key={q.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 text-white">
                          <Icon name="quotes" size={16} />
                        </span>
                        <div>
                          <p className="text-sm font-bold">{q.number}</p>
                          <p className="text-xs text-slate-400">{client?.company}</p>
                        </div>
                      </div>
                      <Badge tone={statusTone[q.status]}>{q.status}</Badge>
                    </div>
                    <div className="mt-3 space-y-1">
                      {q.items.slice(0, 2).map((it) => (
                        <div key={it.id} className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span className="truncate">{it.label}</span>
                          <span>{money(it.qty * it.price, true)}</span>
                        </div>
                      ))}
                      {q.items.length > 2 && <p className="text-xs text-slate-400">+{q.items.length - 2} more</p>}
                    </div>
                    <div className="mt-3 flex items-end justify-between border-t border-slate-100 pt-3 dark:border-white/5">
                      <div>
                        <p className="text-xs text-slate-400">Total</p>
                        <p className="text-lg font-extrabold text-gradient">{money(total)}</p>
                      </div>
                      <div className="flex gap-1.5">
                        {flow.indexOf(q.status) >= 0 && flow.indexOf(q.status) < flow.length - 1 && (
                          <Button size="sm" variant="soft" onClick={() => advance(q)}>
                            Mark {flow[flow.indexOf(q.status) + 1]}
                          </Button>
                        )}
                        <button onClick={() => removeQuote(q.id)} className="grid h-8 w-8 place-items-center rounded-xl text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-white/10">
                          <Icon name="trash" size={15} />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">Valid until {formatDate(q.validUntil)}</p>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Quote" maxW="max-w-xl">
        <Field label="Client">
          <Select value={clientId} onChange={(e) => setClientId(e.target.value)}>
            {data.clients.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}
          </Select>
        </Field>
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Line items</p>
          {items.map((it, idx) => (
            <div key={it.id} className="flex gap-2">
              <Input placeholder="Description" value={it.label} onChange={(e) => setItems(items.map((x) => x.id === it.id ? { ...x, label: e.target.value } : x))} className="flex-1" />
              <Input type="number" placeholder="Qty" value={it.qty} onChange={(e) => setItems(items.map((x) => x.id === it.id ? { ...x, qty: Number(e.target.value) } : x))} className="w-16" />
              <Input type="number" placeholder="Price" value={it.price} onChange={(e) => setItems(items.map((x) => x.id === it.id ? { ...x, price: Number(e.target.value) } : x))} className="w-24" />
              {items.length > 1 && (
                <button onClick={() => setItems(items.filter((x) => x.id !== it.id))} className="grid w-9 shrink-0 place-items-center rounded-xl text-slate-400 hover:text-rose-500">
                  <Icon name="close" size={16} />
                </button>
              )}
            </div>
          ))}
          <button onClick={() => setItems([...items, { id: uid("qi"), label: "", qty: 1, price: 0 }])} className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-300">
            <Icon name="plus" size={14} /> Add line item
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
          <span className="text-sm font-semibold">Total</span>
          <span className="text-lg font-extrabold text-gradient">{money(quoteTotal(items))}</span>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Create Quote</Button>
        </div>
      </Modal>
    </div>
  );
}
