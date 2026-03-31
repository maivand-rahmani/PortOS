"use client";

import { useCallback, useRef, useEffect } from "react";

import type { FileSystemNode } from "@/entities/file-system";
import { cn } from "@/shared/lib";

import { NodeIcon } from "../files-shared/files-shared";

type FilesGridProps = {
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
};

export function FilesGrid({
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
}: FilesGridProps) {
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
      className="flex-1 overflow-y-auto p-3"
      onClick={handleBgClick}
      onContextMenu={handleBgContextMenu}
    >
      <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-1">
        {nodes.map((node) => (
          <GridItem
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
          />
        ))}
      </div>
    </div>
  );
}

function GridItem({
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

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-1 rounded-lg p-2 transition-colors",
        isSelected
          ? "bg-[var(--files-accent-light)]"
          : "hover:bg-[var(--files-hover)]",
      )}
    >
      <NodeIcon node={node} size={40} />

      {isRenaming ? (
        <input
          ref={inputRef}
          value={renameValue}
          onChange={(e) => onSetRenameValue(e.target.value)}
          onBlur={onCommitRename}
          onKeyDown={handleRenameKeyDown}
          className="w-full rounded border border-[var(--files-accent)] bg-white px-1 py-0.5 text-center text-[11px] text-[var(--files-text)] outline-none"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className={cn(
            "max-w-full truncate text-center text-[11px] leading-tight",
            isSelected ? "text-[var(--files-accent)]" : "text-[var(--files-text)]",
          )}
          title={node.name}
        >
          {node.name}
        </span>
      )}
    </div>
  );
}
