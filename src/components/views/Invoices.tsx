"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { money, formatDate } from "@/lib/utils";
import { getMetrics, revenueSeries } from "@/lib/metrics";
import { Card, Badge, Button, Modal, Field, Input, Select, AreaChart, Sparkline, EmptyState } from "../ui";
import { Icon } from "../Icon";
import type { Invoice, InvoiceStatus } from "@/lib/types";

const statusTone: Record<InvoiceStatus, "emerald" | "amber" | "rose" | "slate"> = {
  paid: "emerald",
  pending: "amber",
  overdue: "rose",
  draft: "slate",
};

export function Invoices({ query }: { query: string }) {
  const { data, addInvoice, updateInvoice, removeInvoice, pushNotification } = useStore();
  const m = getMetrics(data);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"all" | InvoiceStatus>("all");
  const [form, setForm] = useState({ clientId: data.clients[0]?.id ?? "", amount: "", status: "pending" as InvoiceStatus, dueDays: "14" });

  const filtered = data.invoices.filter((i) => {
    const client = data.clients.find((c) => c.id === i.clientId);
    const s = `${i.number} ${client?.company ?? ""}`.toLowerCase();
    const matchQ = !query || s.includes(query.toLowerCase());
    const matchTab = tab === "all" || i.status === tab;
    return matchQ && matchTab;
  });

  function submit() {
    if (!form.amount) return;
    addInvoice({
      number: `INV-${175 + data.invoices.length}`,
      clientId: form.clientId,
      amount: Number(form.amount),
      status: form.status,
      issuedAt: Date.now(),
      dueAt: Date.now() + (Number(form.dueDays) || 14) * 86400000,
      paidAt: form.status === "paid" ? Date.now() : undefined,
    });
    setForm({ clientId: data.clients[0]?.id ?? "", amount: "", status: "pending", dueDays: "14" });
    setOpen(false);
  }

  function markPaid(inv: Invoice) {
    updateInvoice(inv.id, { status: "paid", paidAt: Date.now() });
    pushNotification({ title: "Payment received", body: `${inv.number} marked as paid — ${money(inv.amount)}.`, kind: "success" });
  }

  const summary = [
    { label: "Paid", value: money(m.totalRevenue, true), tone: "emerald" as const },
    { label: "Outstanding", value: money(m.outstanding, true), tone: "brand" as const },
    { label: "Overdue", value: money(m.overdue, true), tone: "rose" as const },
  ];
  const rev = revenueSeries(data);

  const tabs: { k: "all" | InvoiceStatus; label: string }[] = [
    { k: "all", label: "All" },
    { k: "paid", label: "Paid" },
    { k: "pending", label: "Pending" },
    { k: "overdue", label: "Overdue" },
    { k: "draft", label: "Draft" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Invoices &amp; Payments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{data.invoices.length} invoices</p>
        </div>
        <Button icon="plus" onClick={() => setOpen(true)}>New Invoice</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {summary.map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className={`mt-1 text-xl font-extrabold ${s.tone === "rose" ? "text-rose-500" : s.tone === "emerald" ? "text-emerald-500" : ""}`}>{s.value}</p>
            <div className="mt-1 -mb-1">
              <Sparkline data={rev.map((v, i) => v * (0.5 + (i % 4) * 0.18))} tone={s.tone === "rose" ? "rose" : s.tone === "emerald" ? "emerald" : "brand"} height={24} />
            </div>
          </Card>
        ))}
      </div>

      {/* Revenue chart */}
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold">Revenue Summary</h2>
          <Badge tone="emerald" dot>Trending up</Badge>
        </div>
        <AreaChart data={rev} height={160} tone="emerald" labels={["W1", "W2", "W3", "W4", "W5", "W6", "W7"]} />
      </Card>

      {/* Tabs */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === t.k ? "bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-md shadow-brand-600/25" : "card text-slate-600 dark:text-slate-300"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState icon="invoices" title="No invoices" description="Create your first invoice and track payments effortlessly." action={<Button icon="plus" onClick={() => setOpen(true)}>Create Invoice</Button>} />
      ) : (
        <Card className="divide-y divide-slate-100 overflow-hidden dark:divide-white/5">
          <AnimatePresence>
            {filtered.map((i) => {
              const client = data.clients.find((c) => c.id === i.clientId);
              const overdue = i.status === "overdue";
              return (
                <motion.div key={i.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} className="group flex items-center gap-3 p-4">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${overdue ? "bg-rose-50 text-rose-500 dark:bg-rose-500/15" : "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"}`}>
                    <Icon name="invoices" size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{i.number} · {client?.company}</p>
                    <p className="text-xs text-slate-400">Due {formatDate(i.dueAt)}{i.paidAt ? ` · Paid ${formatDate(i.paidAt)}` : ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold">{money(i.amount)}</p>
                    <Badge tone={statusTone[i.status]}>{i.status}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {i.status !== "paid" && (
                      <Button size="sm" variant="soft" onClick={() => markPaid(i)}>Paid</Button>
                    )}
                    <button onClick={() => removeInvoice(i.id)} className="grid h-8 w-8 place-items-center rounded-xl text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 dark:hover:bg-white/10">
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Invoice">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Client">
            <Select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
              {data.clients.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}
            </Select>
          </Field>
          <Field label="Amount ($)"><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="5000" /></Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as InvoiceStatus })}>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="draft">Draft</option>
            </Select>
          </Field>
          <Field label="Due in (days)"><Input type="number" value={form.dueDays} onChange={(e) => setForm({ ...form, dueDays: e.target.value })} /></Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Create Invoice</Button>
        </div>
      </Modal>
    </div>
  );
}
