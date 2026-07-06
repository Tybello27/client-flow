export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

export function money(n: number, compact = false): string {
  if (compact && Math.abs(n) >= 1000) {
    return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);
  const future = diff < 0;
  const fmt = (v: number, unit: string) =>
    future ? `in ${v} ${unit}${v === 1 ? "" : "s"}` : `${v} ${unit}${v === 1 ? "" : "s"} ago`;
  if (abs < 60000) return future ? "soon" : "just now";
  if (mins < 60) return fmt(mins, "min");
  if (hours < 24) return fmt(hours, "hour");
  if (days < 30) return fmt(days, "day");
  const months = Math.round(days / 30);
  return fmt(months, "month");
}

export function formatDate(ts: number, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(ts).toLocaleDateString("en-US", opts ?? { month: "short", day: "numeric" });
}

export function quoteTotal(items: { qty: number; price: number }[]): number {
  return items.reduce((s, i) => s + i.qty * i.price, 0);
}

export function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

export function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
