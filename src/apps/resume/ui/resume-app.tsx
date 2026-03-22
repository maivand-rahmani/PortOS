import type { AppComponentProps } from "@/entities/app";
import { getProfileBasics } from "@/shared/lib";

const profile = getProfileBasics() as {
  name?: string;
  title?: string;
  summary?: string;
  skills?: string[];
};

export function ResumeApp({ processId }: AppComponentProps) {
  return (
    <div className="resume-app flex h-full flex-col gap-4 rounded-[24px] p-4">
      <section className="rounded-[24px] bg-white/82 p-5 shadow-panel">
        <p className="text-[11px] uppercase tracking-[0.24em] text-teal-700/60">Resume</p>
        <h2 className="mt-3 font-display text-4xl font-semibold text-teal-950">{profile.name}</h2>
        <p className="mt-2 text-lg text-teal-950/75">{profile.title}</p>
        <p className="mt-4 text-sm leading-7 text-teal-950/72">{profile.summary}</p>
      </section>
      <section className="grid min-h-0 flex-1 gap-4 md:grid-cols-[1fr_1.1fr]">
        <article className="rounded-[24px] bg-white/82 p-5 shadow-panel">
          <p className="text-xs uppercase tracking-[0.22em] text-teal-700/60">Session</p>
          <p className="mt-3 text-3xl font-semibold text-teal-950">{processId.slice(0, 6)}</p>
        </article>
        <article className="rounded-[24px] bg-white/82 p-5 shadow-panel">
          <p className="text-xs uppercase tracking-[0.22em] text-teal-700/60">Skills</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.skills?.map((skill) => (
              <span key={skill} className="rounded-full bg-teal-100 px-3 py-2 text-xs font-semibold text-teal-700">{skill}</span>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
