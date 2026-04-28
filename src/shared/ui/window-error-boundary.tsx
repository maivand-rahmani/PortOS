"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type WindowErrorBoundaryProps = {
  appName: string;
  windowTitle: string;
  children: ReactNode;
  onClose?: () => void;
};

type WindowErrorBoundaryState = {
  hasError: boolean;
  retryKey: number;
};

export class WindowErrorBoundary extends Component<
  WindowErrorBoundaryProps,
  WindowErrorBoundaryState
> {
  state: WindowErrorBoundaryState = {
    hasError: false,
    retryKey: 0,
  };

  static getDerivedStateFromError(): WindowErrorBoundaryState {
    return {
      hasError: true,
      retryKey: 0,
    };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {}

  private handleRetry = () => {
    this.setState((state) => ({
      hasError: false,
      retryKey: state.retryKey + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-4 rounded-[24px] border border-black/10 bg-white/65 px-6 text-center text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              App crashed
            </p>
            <h3 className="text-xl font-semibold">{this.props.windowTitle}</h3>
            <p className="max-w-sm text-sm text-muted">
              {this.props.appName} hit a render error. The rest of PortOS is still running.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/40 bg-white/70 px-5 text-sm font-semibold text-foreground shadow-[0_10px_24px_rgba(15,23,42,0.14)] transition hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              Retry app
            </button>

            {this.props.onClose ? (
              <button
                type="button"
                onClick={this.props.onClose}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/10 bg-black/5 px-5 text-sm font-semibold text-foreground/80 transition hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                Close window
              </button>
            ) : null}
          </div>
        </div>
      );
    }

    return <div key={this.state.retryKey} className="h-full">{this.props.children}</div>;
  }
}
