import type { AppConfig } from "@/entities/app";

type SplitViewPickerProps = {
  apps: AppConfig[];
  side: "left" | "right";
  onChooseApp: (appId: string) => void;
  onCancel: () => void;
};

export function SplitViewPicker({ apps, side, onChooseApp, onCancel }: SplitViewPickerProps) {
  return (
    <div className="pointer-events-auto relative flex h-full w-full flex-col justify-center bg-[linear-gradient(180deg,rgba(24,28,38,0.74),rgba(12,14,20,0.86))] px-6 py-8 text-white">
      <div className="mx-auto w-full max-w-[420px] rounded-[32px] border border-white/12 bg-white/10 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">
          Split View
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">
          Choose an app for the {side} side
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/64">
          Open a second app in this fullscreen space. Running apps will reuse their latest window.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {apps.map((app) => {
            const Icon = app.icon;

            return (
              <button
                key={app.id}
                type="button"
                onClick={() => onChooseApp(app.id)}
                className="flex min-h-[112px] flex-col items-start justify-between rounded-[24px] border border-white/12 bg-white/10 p-4 text-left transition-colors hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">{app.name}</span>
                  <span className="mt-1 block text-xs text-white/55">Open in split view</span>
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="mt-5 inline-flex min-h-[42px] items-center justify-center rounded-full border border-white/14 px-4 text-sm font-medium text-white/82 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          Cancel Split
        </button>
      </div>
    </div>
  );
}
