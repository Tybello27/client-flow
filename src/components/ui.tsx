"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  type ButtonHTMLAttributes,
  type ReactNode,
  useEffect,
  useId,
} from "react";
import { Icon, type IconName } from "./Icon";

/* ---------------- Card ---------------- */
export function Card({
  children,
  className = "",
  glass = false,
}: {
  children: ReactNode;
  className?: string;
  glass?: boolean;
}) {
  return (
    <div className={`${glass ? "glass" : "card"} rounded-3xl ${className}`}>
      {children}
    </div>
  );
}

/* ---------------- Badge ---------------- */
const badgeTones: Record<string, string> = {
  indigo: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
  purple: "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  sky: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
};

export function Badge({
  children,
  tone = "slate",
  className = "",
  dot = false,
}: {
  children: ReactNode;
  tone?: keyof typeof badgeTones;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeTones[tone]} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* ---------------- Button ---------------- */
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "soft" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: IconName;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  children,
  className = "",
  ...props
}: BtnProps) {
  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-lg shadow-brand-600/25 hover:from-brand-500 hover:to-purple-500",
    ghost:
      "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5",
    soft: "bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-300 dark:hover:bg-brand-500/25",
    outline:
      "border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5",
    danger:
      "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300",
  };
  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs rounded-xl gap-1.5",
    md: "px-4 py-2.5 text-sm rounded-2xl gap-2",
    lg: "px-6 py-3 text-base rounded-2xl gap-2",
  };
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={`inline-flex items-center justify-center font-semibold transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {icon && <Icon name={icon} size={size === "sm" ? 15 : 18} />}
      {children}
    </motion.button>
  );
}

/* ---------------- Avatar ---------------- */
export function Avatar({
  label,
  gradient,
  size = 40,
  rounded = "rounded-2xl",
}: {
  label: string;
  gradient: string;
  size?: number;
  rounded?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center font-bold text-white ${rounded}`}
      style={{
        width: size,
        height: size,
        background: gradient,
        fontSize: size * 0.4,
      }}
    >
      {label}
    </span>
  );
}

/* ---------------- Progress ---------------- */
export function Progress({
  value,
  tone = "brand",
  className = "",
}: {
  value: number;
  tone?: "brand" | "emerald" | "amber" | "rose";
  className?: string;
}) {
  const tones: Record<string, string> = {
    brand: "from-brand-500 to-purple-500",
    emerald: "from-emerald-500 to-teal-400",
    amber: "from-amber-500 to-orange-400",
    rose: "from-rose-500 to-pink-400",
  };
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10 ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${tones[tone]}`}
      />
    </div>
  );
}

/* ---------------- Modal ---------------- */
export function Modal({
  open,
  onClose,
  title,
  children,
  maxW = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxW?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className={`card w-full ${maxW} max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl`}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white/90 px-6 py-4 backdrop-blur dark:border-white/5 dark:bg-[#14141f]/90">
              <h3 className="text-lg font-bold">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Form fields ---------------- */
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:focus:border-brand-500 dark:focus:bg-white/10 dark:focus:ring-brand-500/20";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea {...props} className={`${inputCls} min-h-24 resize-y ${props.className ?? ""}`} />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`${inputCls} appearance-none pr-10 ${props.className ?? ""}`}
      />
      <Icon
        name="chevronDown"
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

/* ---------------- Empty state ---------------- */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: IconName;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 px-6 py-14 text-center dark:border-white/10"
    >
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/10 to-purple-500/10 text-brand-500 dark:text-brand-300">
        <Icon name={icon} size={30} />
      </div>
      <h3 className="text-base font-bold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}

/* ---------------- Skeleton ---------------- */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-2xl ${className}`} />;
}

/* ---------------- Charts ---------------- */
export function AreaChart({
  data,
  height = 140,
  tone = "brand",
  labels,
}: {
  data: number[];
  height?: number;
  tone?: "brand" | "emerald" | "rose";
  labels?: string[];
}) {
  const w = 320;
  const h = height;
  const pad = 8;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1 || 1);
  const pts = data.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (h - pad * 2) * (1 - (v - min) / range);
    return [x, y];
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${h - pad} L${pts[0][0]},${h - pad} Z`;
  const colors: Record<string, [string, string]> = {
    brand: ["#6366f1", "#a855f7"],
    emerald: ["#10b981", "#34d399"],
    rose: ["#f43f5e", "#fb7185"],
  };
  const [c1, c2] = colors[tone];
  const gid = `g_${tone}_${data.length}`;
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c1} stopOpacity="0.35" />
            <stop offset="100%" stopColor={c2} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${gid}_line`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          d={area}
          fill={`url(#${gid})`}
        />
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
          d={line}
          fill="none"
          stroke={`url(#${gid}_line)`}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </svg>
      {labels && (
        <div className="mt-2 flex justify-between px-1 text-[10px] font-medium text-slate-400">
          {labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sparkline({
  data,
  tone = "brand",
  height = 40,
}: {
  data: number[];
  tone?: "brand" | "emerald" | "rose";
  height?: number;
}) {
  const w = 100;
  const h = height;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = w / (data.length - 1 || 1);
  const line = data
    .map((v, i) => `${i === 0 ? "M" : "L"}${i * step},${h - (h * (v - min)) / range}`)
    .join(" ");
  const colors: Record<string, string> = {
    brand: "#6366f1",
    emerald: "#10b981",
    rose: "#f43f5e",
  };
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1 }}
        d={line}
        fill="none"
        stroke={colors[tone]}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BarChart({
  data,
  labels,
  height = 150,
}: {
  data: number[];
  labels: string[];
  height?: number;
}) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(v / max) * 100}%` }}
              transition={{ duration: 0.7, delay: i * 0.05 }}
              className="w-full rounded-lg bg-gradient-to-t from-brand-500/70 to-purple-500"
            />
          </div>
          <span className="text-[10px] font-medium text-slate-400">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
