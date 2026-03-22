"use client";

import { useState } from "react";

import type { AppComponentProps } from "@/entities/app";
import { getProfileBasics } from "@/shared/lib";

const profile = getProfileBasics();

export function ContactApp({ processId }: AppComponentProps) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<string | null>(null);

  async function submitForm() {
    setStatus(null);

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const payload = (await response.json()) as { error?: string; submittedAt?: string };

    if (!response.ok) {
      setStatus(payload.error ?? "Submission failed.");
      return;
    }

    setStatus(`Saved at ${payload.submittedAt}`);
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <div className="contact-app flex h-full gap-4 rounded-[24px] p-4">
      <aside className="w-56 rounded-[24px] bg-white/80 p-4 shadow-panel">
        <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-700/60">Contact</p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-cyan-950">Reach out</h2>
        <div className="mt-4 space-y-3 text-sm text-cyan-950/75">
          <p>{String(profile.name ?? "Maivand Rahmani")}</p>
          <p>{String(profile.title ?? "Builder")}</p>
          <p>{String((profile as { contact?: { email?: string } }).contact?.email ?? "-")}</p>
          <p>Session {processId.slice(0, 6)}</p>
        </div>
      </aside>
      <section className="flex min-h-0 flex-1 flex-col rounded-[24px] bg-white/80 p-5 shadow-panel">
        <div className="grid gap-3 md:grid-cols-2">
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Name" className="rounded-[18px] border border-cyan-200 bg-white/85 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400/60" />
          <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" className="rounded-[18px] border border-cyan-200 bg-white/85 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400/60" />
        </div>
        <textarea value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} placeholder="Message" className="mt-3 min-h-0 flex-1 resize-none rounded-[18px] border border-cyan-200 bg-white/85 p-4 outline-none focus:ring-2 focus:ring-cyan-400/60" />
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm text-cyan-900/60">{status}</p>
          <button type="button" onClick={() => void submitForm()} className="cursor-pointer rounded-full bg-cyan-500 px-4 py-3 text-sm font-semibold text-white">Send</button>
        </div>
      </section>
    </div>
  );
}
