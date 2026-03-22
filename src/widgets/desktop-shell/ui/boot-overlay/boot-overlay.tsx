import { MonitorSmartphone } from "lucide-react";
import { motion } from "framer-motion";

type BootOverlayProps = {
  progress: number;
};

export function BootOverlay({ progress }: BootOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeOut" } }}
      className="absolute inset-0 z-[900] flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(48,76,126,0.85),rgba(8,12,20,0.96)_62%)]"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex w-[min(24rem,calc(100vw-2.5rem))] flex-col items-center rounded-[32px] border border-white/10 bg-white/8 px-6 py-8 text-white shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-3xl"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/20 bg-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          <MonitorSmartphone className="h-10 w-10" aria-hidden="true" />
        </div>
        <h1 className="font-display mt-5 text-2xl font-bold tracking-tight">PortOS</h1>
        <p className="mt-2 text-sm text-white/72">Booting the portfolio desktop environment</p>

        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/12">
          <motion.div
            className="h-full rounded-full bg-white"
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
          />
        </div>

        <p className="mt-3 text-xs tracking-[0.18em] text-white/62">{progress}% READY</p>
      </motion.div>
    </motion.div>
  );
}
