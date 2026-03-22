import {
  BatteryFull,
  MonitorSmartphone,
  Search,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";

type MacMenuBarProps = {
  processCount: number;
};

export function MacMenuBar({ processCount }: MacMenuBarProps) {
  const time = useCurrentTime();

  return (
    <header className="absolute inset-x-0 top-0 z-[600] flex h-9 items-center justify-between border-b border-white/10 bg-black/25 px-3 text-[13px] text-white shadow-[0_10px_40px_rgba(4,10,20,0.18)] backdrop-blur-xl sm:px-5">
      <div className="flex items-center gap-4">
        <span className="font-semibold tracking-tight">PortOS</span>
        <nav className="hidden items-center gap-4 text-white/88 md:flex">
          <span>Finder</span>
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Window</span>
          <span>Help</span>
        </nav>
      </div>

      <div className="flex items-center gap-3 text-white/88">
        <span className="hidden items-center gap-1 md:flex">
          <MonitorSmartphone className="h-3.5 w-3.5" aria-hidden="true" />
          {processCount} Active
        </span>
        <Search className="h-4 w-4" aria-hidden="true" />
        <Wifi className="h-4 w-4" aria-hidden="true" />
        <BatteryFull className="h-4 w-4" aria-hidden="true" />
        <span>{time}</span>
      </div>
    </header>
  );
}

function useCurrentTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    const update = () => {
      setTime(formatter.format(new Date()));
    };

    update();

    const intervalId = window.setInterval(update, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return time;
}
