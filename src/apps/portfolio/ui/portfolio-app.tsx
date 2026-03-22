import type { AppComponentProps } from "@/entities/app";
import { getProfileProjects } from "@/shared/lib";

const projects = getProfileProjects() as Array<{ name?: string; type?: string; summary?: string; stack?: string[] }>;

export function PortfolioApp({ processId }: AppComponentProps) {
  return (
    <div className="portfolio-app flex h-full flex-col gap-4 rounded-[24px] p-4">
      <div className="rounded-[24px] bg-white/82 p-5 shadow-panel">
        <p className="text-[11px] uppercase tracking-[0.24em] text-rose-700/60">Portfolio</p>
        <p className="mt-2 text-sm text-rose-950/60">Project reel {processId.slice(0, 6)}</p>
      </div>
      <div className="grid min-h-0 flex-1 gap-4 overflow-auto md:grid-cols-2">
        {projects.map((project) => (
          <article key={project.name} className="rounded-[24px] bg-white/82 p-5 shadow-panel">
            <p className="text-xs uppercase tracking-[0.22em] text-rose-700/55">{project.type}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-rose-950">{project.name}</h2>
            <p className="mt-4 text-sm leading-7 text-rose-950/72">{project.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.stack?.map((item) => (
                <span key={item} className="rounded-full bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700">{item}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
