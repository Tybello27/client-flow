"use client";

import { motion } from "framer-motion";
import { Icon } from "./Icon";
import { Skeleton } from "./ui";

export function LoadingScreen() {
  return (
    <div className="app-bg min-h-screen">
      <div className="mx-auto flex max-w-[1500px]">
        <aside className="hidden h-screen w-64 shrink-0 border-r border-slate-200/70 px-4 py-6 lg:block dark:border-white/5">
          <div className="mb-8 flex items-center gap-2.5 px-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-purple-600 text-white shadow-lg shadow-brand-600/25"
            >
              <Icon name="sparkles" size={20} />
            </motion.div>
            <div>
              <p className="text-lg font-extrabold leading-none">ClientFlow</p>
              <p className="text-[11px] text-slate-400">Loading…</p>
            </div>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6">
          <Skeleton className="mb-5 h-32 w-full rounded-3xl" />
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-3xl" />
            ))}
          </div>
          <div className="grid gap-5 lg:grid-cols-5">
            <Skeleton className="h-56 rounded-3xl lg:col-span-3" />
            <Skeleton className="h-56 rounded-3xl lg:col-span-2" />
          </div>
        </main>
      </div>
    </div>
  );
}
