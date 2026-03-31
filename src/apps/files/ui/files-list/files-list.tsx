"use client";

import { useCallback, useRef, useEffect } from "react";

import type { FileSystemNode } from "@/entities/file-system";
import { cn } from "@/shared/lib";

import { NodeIcon, formatFileSize, formatNodeDateShort } from "../files-shared/files-shared";

type FilesListProps = {
  nodes: FileSystemNode[];
  selectedNodeIds: Set<string>;
  renamingNodeId: string | null;
  renameValue: string;
  onSelect: (nodeId: string, additive: boolean) => void;
  onOpen: (nodeId: string) => void;
  onStartRename: (nodeId: string) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onSetRenameValue: (value: string) => void;
  onContextMenu: (x: number, y: number, nodeId: string | null) => void;
  onClearSelection: () => void;
  onItemPointerDown: (nodeId: string, event: React.PointerEvent) => void;
};

export function FilesList({
  nodes,
  selectedNodeIds,
  renamingNodeId,
  renameValue,
  onSelect,
  onOpen,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onSetRenameValue,
  onContextMenu,
  onClearSelection,
  onItemPointerDown,
}: FilesListProps) {
  const handleBgContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onContextMenu(e.clientX, e.clientY, null);
    },
    [onContextMenu],
  );

  const handleBgClick = useCallback(() => {
    onClearSelection();
  }, [onClearSelection]);

  if (nodes.length === 0) {
    return (
      <div
        className="flex flex-1 items-center justify-center text-[13px] text-[var(--files-text-secondary)]"
        onContextMenu={handleBgContextMenu}
      >
        This folder is empty
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto"
      onClick={handleBgClick}
      onContextMenu={handleBgContextMenu}
    >
      {/* Header row */}
      <div className="sticky top-0 z-10 grid grid-cols-[1fr_100px_140px] gap-2 border-b border-[var(--files-border)] bg-[var(--files-bg)] px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--files-text-secondary)]">
        <span>Name</span>
        <span className="text-right">Size</span>
        <span className="text-right">Modified</span>
      </div>

      {/* Rows */}
      {nodes.map((node) => (
        <ListRow
          key={node.id}
          node={node}
          isSelected={selectedNodeIds.has(node.id)}
          isRenaming={renamingNodeId === node.id}
          renameValue={renameValue}
          onSelect={onSelect}
          onOpen={onOpen}
          onSetRenameValue={onSetRenameValue}
          onCommitRename={onCommitRename}
          onCancelRename={onCancelRename}
          onContextMenu={onContextMenu}
          onItemPointerDown={onItemPointerDown}
        />
      ))}
    </div>
  );
}

function ListRow({
  node,
  isSelected,
  isRenaming,
  renameValue,
  onSelect,
  onOpen,
  onSetRenameValue,
  onCommitRename,
  onCancelRename,
  onContextMenu,
  onItemPointerDown,
}: {
  node: FileSystemNode;
  isSelected: boolean;
  isRenaming: boolean;
  renameValue: string;
  onSelect: (nodeId: string, additive: boolean) => void;
  onOpen: (nodeId: string) => void;
  onSetRenameValue: (value: string) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onContextMenu: (x: number, y: number, nodeId: string | null) => void;
  onItemPointerDown: (nodeId: string, event: React.PointerEvent) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(node.id, e.metaKey || e.ctrlKey);
    },
    [node.id, onSelect],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onOpen(node.id);
    },
    [node.id, onOpen],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onContextMenu(e.clientX, e.clientY, node.id);
    },
    [node.id, onContextMenu],
  );

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onCommitRename();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancelRename();
      }
    },
    [onCommitRename, onCancelRename],
  );

  const sizeText =
    node.type === "file" ? formatFileSize(node.size) : "--";

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerDown={(event) => onItemPointerDown(node.id, event)}
      onContextMenu={handleContextMenu}
      className={cn(
        "grid cursor-pointer grid-cols-[1fr_100px_140px] items-center gap-2 border-b border-[var(--files-border)]/50 px-3 py-1.5 transition-colors",
        isSelected
          ? "bg-[var(--files-accent-light)]"
          : "hover:bg-[var(--files-hover)]",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <NodeIcon node={node} size={20} />

        {isRenaming ? (
          <input
            ref={inputRef}
            value={renameValue}
            onChange={(e) => onSetRenameValue(e.target.value)}
            onBlur={onCommitRename}
            onKeyDown={handleRenameKeyDown}
            className="min-w-0 flex-1 rounded border border-[var(--files-accent)] bg-white px-1 py-0.5 text-[12px] text-[var(--files-text)] outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className={cn(
              "truncate text-[12px]",
              isSelected ? "text-[var(--files-accent)]" : "text-[var(--files-text)]",
            )}
            title={node.name}
          >
            {node.name}
          </span>
        )}
      </div>

      <span className="text-right text-[11px] text-[var(--files-text-secondary)]">
        {sizeText}
      </span>

      <span className="text-right text-[11px] text-[var(--files-text-secondary)]">
        {formatNodeDateShort(node.updatedAt)}
      </span>
    </div>
  );
}
