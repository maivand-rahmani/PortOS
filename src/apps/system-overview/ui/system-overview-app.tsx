import { ActivitySquare, Cpu, Layers3 } from "lucide-react";

import type { AppComponentProps } from "@/entities/app";
import { cn } from "@/shared/lib";

import { systemOverviewSections } from "../model/content";

const overviewIcons = [Layers3, ActivitySquare, Cpu];

export function SystemOverviewApp({ processId, windowId }: AppComponentProps) {
  return (
    <div className="system-overview-app flex h-full flex-col gap-4">
      <section className="system-overview-app__hero rounded-panel bg-surface px-4 py-4 shadow-panel backdrop-blur-xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">
          Runtime instance
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted">Process ID</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {processId.slice(0, 8)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Window ID</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {windowId.slice(0, 8)}
            </p>
          </div>
        </div>
      </section>

      <section className="grid flex-1 gap-3 md:grid-cols-3">
        {systemOverviewSections.map((section, index) => {
          const Icon = overviewIcons[index % overviewIcons.length];

          return (
            <article
              key={section.title}
              className={cn(
                "system-overview-app__card rounded-panel bg-window px-4 py-4 shadow-panel",
                "transition-transform duration-200 ease-out hover:-translate-y-0.5",
              )}
            >
              <span className="system-overview-app__badge flex h-11 w-11 items-center justify-center rounded-2xl text-accent">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {section.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {section.description}
              </p>
            </article>
          );
        })}
      </section>

      <p className="text-sm leading-6 text-muted">
        This app is loaded lazily from <code>src/apps/system-overview</code> by the
        app registry and rendered inside the active OS window.
      </p>
    </div>
  );
}
