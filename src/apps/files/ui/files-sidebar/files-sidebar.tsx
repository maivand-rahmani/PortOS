"use client";

import { ChevronRight, Folder, HardDrive } from "lucide-react";

import type { FileSystemNode } from "@/entities/file-system";
import { cn } from "@/shared/lib";

type FilesSidebarProps = {
  roots: FileSystemNode[];
  currentDirId: string | null;
  onNavigate: (nodeId: string | null) => void;
};

export function FilesSidebar({
  roots,
  currentDirId,
  onNavigate,
}: FilesSidebarProps) {
  return (
    <aside className="flex h-full min-h-0 w-[var(--files-sidebar-width)] flex-col border-r border-[var(--files-border)] bg-[var(--files-sidebar-bg)]">
      <div className="px-3 pb-1 pt-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--files-text-secondary)]">
          Locations
        </span>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2">
        <SidebarItem
          label="Root"
          icon={<HardDrive className="h-4 w-4 text-[var(--files-text-secondary)]" />}
          isActive={currentDirId === null}
          onClick={() => onNavigate(null)}
        />

        {roots.map((root) => (
          <SidebarItem
            key={root.id}
            label={root.name}
            icon={<Folder className="h-4 w-4 text-[var(--files-accent)]" />}
            isActive={currentDirId === root.id}
            onClick={() => onNavigate(root.id)}
          />
        ))}
      </nav>
    </aside>
  );
}

function SidebarItem({
  label,
  icon,
  isActive,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors",
        isActive
          ? "bg-[var(--files-accent)] text-[var(--files-selected-text)]"
          : "text-[var(--files-text)] hover:bg-[var(--files-hover)]",
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}
