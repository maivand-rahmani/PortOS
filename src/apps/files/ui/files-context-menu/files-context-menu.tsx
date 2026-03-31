"use client";

import { useCallback, useEffect, useRef } from "react";

import {
  Clipboard,
  ClipboardPaste,
  Copy,
  FilePlus,
  FolderPlus,
  Pencil,
  Scissors,
  Trash2,
} from "lucide-react";

import { cn } from "@/shared/lib";

type FilesContextMenuProps = {
  x: number;
  y: number;
  nodeId: string | null;
  hasClipboard: boolean;
  canCreate: boolean;
  onClose: () => void;
  onOpen: (nodeId: string) => void;
  onRename: (nodeId: string) => void;
  onDelete: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onCreateFile: () => void;
  onCreateFolder: () => void;
};

export function FilesContextMenu({
  x,
  y,
  nodeId,
  hasClipboard,
  canCreate,
  onClose,
  onOpen,
  onRename,
  onDelete,
  onCut,
  onCopy,
  onPaste,
  onCreateFile,
  onCreateFolder,
}: FilesContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Adjust position if menu would overflow viewport
  const adjustedStyle = {
    top: y,
    left: x,
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] rounded-lg border border-[var(--files-border)] bg-white py-1 shadow-xl"
      style={adjustedStyle}
    >
      {nodeId ? (
        <>
          <MenuItem
            label="Open"
            onClick={() => {
              onOpen(nodeId);
              onClose();
            }}
          />

          <MenuItem
            label="Rename"
            icon={<Pencil className="h-3.5 w-3.5" />}
            onClick={() => {
              onRename(nodeId);
              onClose();
            }}
          />

          <MenuSeparator />

          <MenuItem
            label="Cut"
            icon={<Scissors className="h-3.5 w-3.5" />}
            shortcut="Cmd+X"
            onClick={() => {
              onCut();
              onClose();
            }}
          />

          <MenuItem
            label="Copy"
            icon={<Copy className="h-3.5 w-3.5" />}
            shortcut="Cmd+C"
            onClick={() => {
              onCopy();
              onClose();
            }}
          />

          <MenuSeparator />

          <MenuItem
            label="Delete"
            icon={<Trash2 className="h-3.5 w-3.5" />}
            destructive
            onClick={() => {
              onDelete();
              onClose();
            }}
          />
        </>
      ) : (
        <>
          {canCreate && (
            <>
              <MenuItem
                label="New File"
                icon={<FilePlus className="h-3.5 w-3.5" />}
                onClick={() => {
                  onCreateFile();
                  onClose();
                }}
              />

              <MenuItem
                label="New Folder"
                icon={<FolderPlus className="h-3.5 w-3.5" />}
                onClick={() => {
                  onCreateFolder();
                  onClose();
                }}
              />

              <MenuSeparator />
            </>
          )}

          {hasClipboard && (
            <MenuItem
              label="Paste"
              icon={<ClipboardPaste className="h-3.5 w-3.5" />}
              shortcut="Cmd+V"
              onClick={() => {
                onPaste();
                onClose();
              }}
            />
          )}

          {!canCreate && !hasClipboard && (
            <div className="px-3 py-2 text-[12px] text-[var(--files-text-secondary)]">
              No actions available
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MenuItem({
  label,
  icon,
  shortcut,
  destructive,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors",
        destructive
          ? "text-red-600 hover:bg-red-50"
          : "text-[var(--files-text)] hover:bg-[var(--files-hover)]",
      )}
    >
      {icon && <span className="w-4 flex-shrink-0">{icon}</span>}
      <span className="flex-1">{label}</span>
      {shortcut && (
        <span className="text-[10px] text-[var(--files-text-secondary)]">
          {shortcut}
        </span>
      )}
    </button>
  );
}

function MenuSeparator() {
  return <div className="my-1 h-px bg-[var(--files-border)]" />;
}
