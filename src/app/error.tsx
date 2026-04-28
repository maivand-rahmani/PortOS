"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function ErrorPage({ error, unstable_retry }: ErrorPageProps) {
  useEffect(() => {
    void error;
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-xl rounded-[32px] border border-white/20 bg-white/70 p-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.2)] backdrop-blur-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">PortOS recovery</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">The desktop hit an unexpected error</h1>
        <p className="mt-3 text-sm text-muted">
          PortOS can retry this segment without dropping the whole session.
        </p>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/40 bg-white/80 px-5 text-sm font-semibold text-foreground shadow-[0_10px_24px_rgba(15,23,42,0.14)] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Retry desktop
          </button>
        </div>
      </div>
    </main>
  );
}
