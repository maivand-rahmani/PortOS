import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, Plus, X } from "lucide-react";

import type { ClockTimeZoneOption } from "../../model/content";

export function FavoriteChip({
  city,
  onAdd,
  onSpotlight,
  onToggleFavorite,
}: {
  city: ClockTimeZoneOption;
  onAdd: () => void;
  onSpotlight: () => void;
  onToggleFavorite: () => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={city}
      dragListener={false}
      dragControls={dragControls}
      whileDrag={{ scale: 1.03, boxShadow: "0 12px 34px rgba(2,6,23,0.45)" }}
      className="shrink-0 list-none"
    >
      <div className="flex min-h-[48px] items-center gap-2 rounded-[18px] border border-amber-300/18 bg-amber-300/10 px-3 py-2 text-amber-50 shadow-[0_10px_24px_rgba(120,53,15,0.14)]">
        <button
          type="button"
          onPointerDown={(event) => dragControls.start(event)}
          className="inline-flex min-h-[32px] min-w-[28px] cursor-grab items-center justify-center rounded-full text-amber-100/72 active:cursor-grabbing"
          aria-label={`Reorder ${city.city}`}
        >
          <GripVertical className="h-4 w-4" strokeWidth={2.3} />
        </button>
        <button type="button" onClick={onSpotlight} className="cursor-pointer text-sm font-semibold">
          {city.city}
        </button>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex min-h-[30px] min-w-[30px] cursor-pointer items-center justify-center rounded-full border border-amber-300/24 bg-white/8 text-amber-100"
          aria-label={`Add ${city.city}`}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
        </button>
        <button
          type="button"
          onClick={onToggleFavorite}
          className="inline-flex min-h-[30px] min-w-[30px] cursor-pointer items-center justify-center rounded-full border border-amber-300/24 bg-white/8 text-amber-100"
          aria-label={`Remove ${city.city} favorite`}
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.4} />
        </button>
      </div>
    </Reorder.Item>
  );
}
