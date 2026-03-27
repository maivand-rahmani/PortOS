"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Kalam, Patrick_Hand } from "next/font/google";
import {
  Check,
  Github,
  Mail,
  MapPin,
  PencilLine,
  Send,
  User,
} from "lucide-react";

import type { AppComponentProps } from "@/entities/app";
import { getProfileBasics } from "@/shared/lib";
import { cn } from "@/shared/lib";

const markerFont = Kalam({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const handwritingFont = Patrick_Hand({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const wobbleRadii = {
  shell: "30px 16px 28px 18px / 18px 24px 18px 26px",
  panel: "26px 16px 24px 20px / 18px 24px 16px 28px",
  chip: "999px 18px 999px 22px / 18px 999px 20px 999px",
  button: "24px 18px 22px 16px / 18px 24px 18px 24px",
  tape: "12px 14px 10px 15px / 8px 11px 7px 12px",
};

type ContactProfile = {
  personal?: {
    name?: string;
    role?: string;
    location?: string;
    focus?: string;
  };
  links?: {
    gmail?: string;
    github?: string;
  };
  strengths?: string[];
};

type FormState = {
  name: string;
  email: string;
  message: string;
};

const profile = getProfileBasics() as ContactProfile;

const initialForm: FormState = {
  name: "",
  email: "",
  message: "",
};

export function ContactApp({ processId }: AppComponentProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reduceMotion = useReducedMotion();

  const contactItems = useMemo(
    () => [
      {
        label: "Email",
        value: profile.links?.gmail ?? "-",
        icon: Mail,
        href: profile.links?.gmail ? `mailto:${profile.links.gmail}` : undefined,
      },
      {
        label: "GitHub",
        value: profile.links?.github?.replace(/^https?:\/\//, "") ?? "-",
        icon: Github,
        href: profile.links?.github,
      },
      {
        label: "Location",
        value: profile.personal?.location ?? "Unknown",
        icon: MapPin,
      },
    ],
    [],
  );

  const quickNotes = (profile.strengths ?? []).slice(0, 3);

  async function submitForm() {
    setIsSubmitting(true);
    setStatus(null);
    setStatusTone("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { error?: string; submittedAt?: string };

      if (!response.ok) {
        setStatus(payload.error ?? "Submission failed.");
        setStatusTone("error");
        return;
      }

      setStatus(payload.submittedAt ? `Saved at ${payload.submittedAt}` : "Message saved.");
      setStatusTone("success");
      setForm(initialForm);
    } catch {
      setStatus("Submission failed.");
      setStatusTone("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.985 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={cn("contact-app flex h-full min-h-0 flex-col overflow-hidden p-3 md:p-4", handwritingFont.className)}
    >
      <div
        className="flex min-h-0 flex-1 flex-col border-[3px] border-[#2d2d2d] bg-[#fdfbf7] shadow-[8px_8px_0px_0px_#2d2d2d]"
        style={{ borderRadius: wobbleRadii.shell }}
      >
        <header className="relative border-b-[3px] border-dashed border-[#2d2d2d] px-4 py-4 md:px-6">
          <div
            className="absolute left-6 top-[-10px] h-6 w-24 bg-black/10 opacity-70"
            style={{ borderRadius: wobbleRadii.tape, transform: "rotate(-4deg)" }}
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#2d2d2d]/65">
                <span
                  className="inline-flex items-center gap-2 border-[3px] border-[#2d2d2d] bg-[#fff9c4] px-4 py-1 uppercase tracking-[0.18em] text-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d]"
                  style={{ borderRadius: wobbleRadii.chip, transform: "rotate(-2deg)" }}
                >
                  <Mail className="h-4 w-4" strokeWidth={2.5} />
                  Contact
                </span>
                <span>Session {processId.slice(0, 6)}</span>
              </div>
              <h2 className={cn("mt-4 text-4xl leading-none text-[#2d2d2d] md:text-5xl", markerFont.className)}>
                Reach out directly.
              </h2>
            </div>

            <div className="text-right text-base text-[#2d2d2d]/72">
              <p>{profile.personal?.name ?? "Maivand Rahmani"}</p>
              <p>{profile.personal?.role ?? "Frontend Engineer"}</p>
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col gap-4 border-b-[3px] border-dashed border-[#2d2d2d] bg-[#f7f0e6] p-4 lg:border-b-0 lg:border-r-[3px]">
            <div
              className="border-[3px] border-[#2d2d2d] bg-white p-4 shadow-[4px_4px_0px_0px_#2d2d2d]"
              style={{ borderRadius: wobbleRadii.panel }}
            >
              <p className={cn("text-2xl text-[#2d2d2d]", markerFont.className)}>Details</p>
              <div className="mt-4 space-y-3">
                {contactItems.map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <div className="flex items-start gap-3 rounded-[20px] border-[2px] border-[#2d2d2d] bg-[#fffefb] px-4 py-3">
                      <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border-[2px] border-[#2d2d2d] bg-[#e8f0ff] text-[#2d5da1]">
                        <Icon className="h-4 w-4" strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm uppercase tracking-[0.18em] text-[#2d2d2d]/52">{item.label}</p>
                        <p className="mt-1 break-words text-lg leading-6 text-[#2d2d2d]">{item.value}</p>
                      </div>
                    </div>
                  );

                  return item.href ? (
                    <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="block transition duration-150 hover:-rotate-1">
                      {content}
                    </a>
                  ) : (
                    <div key={item.label}>{content}</div>
                  );
                })}
              </div>
            </div>

            <div
              className="border-[3px] border-[#2d2d2d] bg-[#fff9c4] p-4 shadow-[4px_4px_0px_0px_#2d2d2d]"
              style={{ borderRadius: wobbleRadii.panel, transform: "rotate(-1deg)" }}
            >
              <p className={cn("text-2xl text-[#2d2d2d]", markerFont.className)}>Quick notes</p>
              <div className="mt-4 space-y-3 text-lg leading-7 text-[#2d2d2d]/82">
                {(quickNotes.length > 0 ? quickNotes : [profile.personal?.focus ?? "Building scalable products"]).map((note) => (
                  <div key={note} className="flex items-start gap-3">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-[#ff4d4d]" strokeWidth={2.6} />
                    <p>{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col bg-[#fffdf9] p-4 md:p-5">
            <motion.div
              layout
              className="relative flex min-h-0 flex-1 flex-col overflow-hidden border-[3px] border-[#2d2d2d] bg-[#fffefb] shadow-[8px_8px_0px_0px_#2d2d2d]"
              style={{ borderRadius: wobbleRadii.panel }}
            >
              <div className="contact-app__paper-lines pointer-events-none absolute inset-0 opacity-80" />
              <div
                className="pointer-events-none absolute right-6 top-[-11px] h-6 w-24 bg-black/10"
                style={{ borderRadius: wobbleRadii.tape, transform: "rotate(5deg)" }}
              />

              <div className="relative border-b-[3px] border-dashed border-[#2d2d2d] px-5 py-4 md:px-6">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#2d2d2d]/52">Message</p>
                    <p className="mt-2 text-lg text-[#2d2d2d]/76">Three fields. Clear validation. Real submission.</p>
                  </div>

                  <AnimatePresence mode="wait" initial={false}>
                    {status ? (
                      <motion.div
                        key={status}
                        initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
                        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                        className={cn(
                          "inline-flex items-center gap-2 border-[2px] px-4 py-2 text-base shadow-[4px_4px_0px_0px_#2d2d2d]",
                          statusTone === "success"
                            ? "border-[#2d2d2d] bg-[#e9f8ec] text-[#185b2b]"
                            : statusTone === "error"
                              ? "border-[#2d2d2d] bg-[#ffe5e5] text-[#8b1e1e]"
                              : "border-[#2d2d2d] bg-white text-[#2d2d2d]",
                        )}
                        style={{ borderRadius: wobbleRadii.button }}
                      >
                        {statusTone === "success" ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <PencilLine className="h-4 w-4" strokeWidth={2.5} />}
                        {status}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>

              <div className="relative min-h-0 flex-1 overflow-auto px-5 py-5 md:px-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldBlock label="Name" icon={User}>
                    <input
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Your name"
                      className="w-full border-0 bg-transparent text-lg text-[#2d2d2d] outline-none placeholder:text-[#2d2d2d]/35"
                    />
                  </FieldBlock>

                  <FieldBlock label="Email" icon={Mail}>
                    <input
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                      placeholder="you@example.com"
                      className="w-full border-0 bg-transparent text-lg text-[#2d2d2d] outline-none placeholder:text-[#2d2d2d]/35"
                    />
                  </FieldBlock>
                </div>

                <div className="mt-4">
                  <FieldBlock label="Message" icon={PencilLine} className="min-h-[280px] md:min-h-[320px]">
                    <textarea
                      value={form.message}
                      onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                      placeholder="Tell me what you want to build, improve, or discuss."
                      className="h-full min-h-[220px] w-full resize-none border-0 bg-transparent text-lg leading-8 text-[#2d2d2d] outline-none placeholder:text-[#2d2d2d]/35"
                    />
                  </FieldBlock>
                </div>
              </div>

              <div className="relative border-t-[3px] border-dashed border-[#2d2d2d] px-5 py-4 md:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-base text-[#2d2d2d]/64">Messages are validated before they are saved.</p>
                  <button
                    type="button"
                    onClick={() => void submitForm()}
                    disabled={isSubmitting}
                    className="inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 border-[3px] border-[#2d2d2d] bg-[#ff4d4d] px-5 py-2 text-lg text-white shadow-[4px_4px_0px_0px_#2d2d2d] transition duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#2d2d2d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2d5da1]/25 disabled:cursor-not-allowed disabled:bg-[#f7a7a7] disabled:text-white/80 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_#2d2d2d]"
                    style={{ borderRadius: wobbleRadii.button }}
                  >
                    <Send className="h-4 w-4" strokeWidth={2.6} />
                    {isSubmitting ? "Sending..." : "Send message"}
                  </button>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}

function FieldBlock({
  label,
  icon: Icon,
  className,
  children,
}: {
  label: string;
  icon: typeof User;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex min-h-[76px] flex-col gap-3 border-[3px] border-[#2d2d2d] bg-white px-4 py-4 shadow-[4px_4px_0px_0px_#2d2d2d] focus-within:ring-4 focus-within:ring-[#2d5da1]/20",
        className,
      )}
      style={{ borderRadius: "24px 16px 22px 18px / 18px 24px 16px 26px" }}
    >
      <span className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-[#2d2d2d]/54">
        <Icon className="h-4 w-4 text-[#2d5da1]" strokeWidth={2.4} />
        {label}
      </span>
      <div className="min-h-0 flex-1">{children}</div>
    </label>
  );
}
