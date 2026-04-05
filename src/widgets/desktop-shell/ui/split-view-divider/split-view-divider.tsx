type SplitViewDividerProps = {
  leftWidth: number;
  zIndex: number;
  onPointerDown: (pointerX: number) => void;
};

export function SplitViewDivider({ leftWidth, zIndex, onPointerDown }: SplitViewDividerProps) {
  return (
    <div
      className="pointer-events-none absolute inset-y-0"
      style={{ left: leftWidth - 6, width: 12, zIndex }}
    >
      <button
        type="button"
        aria-label="Resize split view"
        className="pointer-events-auto absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 cursor-col-resize bg-transparent focus-visible:outline-none"
        onPointerDown={(event) => {
          if (event.button !== 0) {
            return;
          }

          event.stopPropagation();
          onPointerDown(event.clientX);
        }}
      >
        <span className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 rounded-full bg-white/40 shadow-[0_0_18px_rgba(255,255,255,0.18)]" />
      </button>
    </div>
  );
}
