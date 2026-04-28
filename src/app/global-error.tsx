"use client";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function GlobalErrorPage({ error, unstable_retry }: GlobalErrorPageProps) {
  void error;

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#0b0f16] text-white">
        <main className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-white/8 p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">System failure</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">PortOS failed to boot</h1>
            <p className="mt-3 text-sm text-white/70">
              The root shell crashed before the desktop could recover itself.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => unstable_retry()}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 bg-white/12 px-5 text-sm font-semibold text-white transition hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
              >
                Retry boot
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
