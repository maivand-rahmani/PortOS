export function DesktopWallpaper() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#d6dbe8_0%,#b7c3da_18%,#7d93bb_38%,#53688f_57%,#1f3154_82%,#0b1628_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.42),transparent_18%),radial-gradient(circle_at_74%_22%,rgba(255,255,255,0.18),transparent_16%),radial-gradient(circle_at_50%_100%,rgba(106,162,255,0.35),transparent_38%)]" />
      <div className="absolute left-[-12%] top-[12%] h-[24rem] w-[24rem] rounded-full bg-white/12 blur-3xl" />
      <div className="absolute bottom-[-14%] right-[-8%] h-[28rem] w-[28rem] rounded-full bg-sky-300/18 blur-3xl" />
    </div>
  );
}
