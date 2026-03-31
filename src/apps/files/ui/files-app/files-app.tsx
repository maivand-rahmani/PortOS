"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { AppComponentProps } from "@/entities/app";
import { cn } from "@/shared/lib";

import { useFilesApp } from "../../model/use-files-app";
import { FilesSidebar } from "../files-sidebar/files-sidebar";
import { FilesToolbar } from "../files-toolbar/files-toolbar";
import { FilesBreadcrumb } from "../files-breadcrumb/files-breadcrumb";
import { FilesGrid } from "../files-grid/files-grid";
import { FilesList } from "../files-list/files-list";
import { FilesPreview } from "../files-preview/files-preview";
import { FilesContextMenu } from "../files-context-menu/files-context-menu";

import "../../theme.css";

export function FilesApp({ windowId }: AppComponentProps) {
  const reduceMotion = useReducedMotion();
  const files = useFilesApp();

  if (!files.fsHydrated) {
    return (
      <div className="files-app flex h-full items-center justify-center bg-[var(--files-bg)] text-[13px] text-[var(--files-text-secondary)]">
        Loading file system...
      </div>
    );
  }

  const canCreate = files.currentDirId !== null;
  const hasClipboard =
    files.fsClipboard !== null && files.fsClipboard.nodeIds.length > 0;

  // If searching, show search results instead of directory contents
  const displayNodes = files.isSearching
    ? files.fsSearchResults.map((r) => r.node)
    : files.visibleChildren;

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
      animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="files-app flex h-full flex-col overflow-hidden bg-[var(--files-bg)]"
      tabIndex={0}
      onKeyDown={files.handleKeyDown}
    >
      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <FilesSidebar
          roots={files.sidebarRoots}
          currentDirId={files.currentDirId}
          onNavigate={files.navigateTo}
        />

        {/* Main content area */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Toolbar */}
          <FilesToolbar
            viewMode={files.viewMode}
            searchQuery={files.searchQuery}
            showHidden={files.showHidden}
            canGoUp={files.currentDirId !== null}
            canCreate={canCreate}
            onSetViewMode={files.setViewMode}
            onSetSearchQuery={files.setSearchQuery}
            onClearSearch={files.clearSearch}
            onToggleHidden={files.toggleHidden}
            onNavigateUp={files.navigateUp}
            onCreateFile={files.createNewFile}
            onCreateFolder={files.createNewFolder}
          />

          {/* Breadcrumb */}
          {!files.isSearching && (
            <FilesBreadcrumb
              trail={files.breadcrumbTrail}
              onNavigate={files.navigateTo}
            />
          )}

          {/* Search indicator */}
          {files.isSearching && (
            <div className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--files-text-secondary)]">
              <span>
                {files.fsSearchResults.length} result{files.fsSearchResults.length !== 1 ? "s" : ""} for &quot;{files.searchQuery}&quot;
              </span>
            </div>
          )}

          {/* Content view */}
          <div className="flex min-h-0 flex-1">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              {files.viewMode === "grid" ? (
                <FilesGrid
                  nodes={displayNodes}
                  selectedNodeIds={files.selectedNodeIds}
                  renamingNodeId={files.renamingNodeId}
                  renameValue={files.renameValue}
                  onSelect={files.selectNode}
                  onOpen={files.openNode}
                  onStartRename={files.startRename}
                  onCommitRename={files.commitRename}
                  onCancelRename={files.cancelRename}
                  onSetRenameValue={files.setRenameValue}
                  onContextMenu={files.openContextMenu}
                  onClearSelection={files.clearSelection}
                />
              ) : (
                <FilesList
                  nodes={displayNodes}
                  selectedNodeIds={files.selectedNodeIds}
                  renamingNodeId={files.renamingNodeId}
                  renameValue={files.renameValue}
                  onSelect={files.selectNode}
                  onOpen={files.openNode}
                  onStartRename={files.startRename}
                  onCommitRename={files.commitRename}
                  onCancelRename={files.cancelRename}
                  onSetRenameValue={files.setRenameValue}
                  onContextMenu={files.openContextMenu}
                  onClearSelection={files.clearSelection}
                />
              )}
            </div>

            {/* Preview panel */}
            {files.previewNode && (
              <FilesPreview
                node={files.previewNode}
                onClose={files.closePreview}
                readContent={files.fsReadContent}
              />
            )}
          </div>

          {/* Status bar */}
          <div className="flex h-[var(--files-statusbar-height)] items-center border-t border-[var(--files-border)] px-3 text-[11px] text-[var(--files-text-secondary)]">
            <span>
              {displayNodes.length} item{displayNodes.length !== 1 ? "s" : ""}
            </span>
            {files.selectedNodeIds.size > 0 && (
              <span className="ml-2">
                ({files.selectedNodeIds.size} selected)
              </span>
            )}
            {hasClipboard && (
              <span className="ml-auto">
                {files.fsClipboard!.nodeIds.length} item{files.fsClipboard!.nodeIds.length !== 1 ? "s" : ""} in clipboard ({files.fsClipboard!.operation})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Context menu */}
      {files.contextMenu && (
        <FilesContextMenu
          x={files.contextMenu.x}
          y={files.contextMenu.y}
          nodeId={files.contextMenu.nodeId}
          hasClipboard={hasClipboard}
          canCreate={canCreate}
          onClose={files.closeContextMenu}
          onOpen={files.openNode}
          onRename={files.startRename}
          onDelete={files.deleteSelected}
          onCut={files.cutSelected}
          onCopy={files.copySelected}
          onPaste={files.pasteHere}
          onCreateFile={files.createNewFile}
          onCreateFolder={files.createNewFolder}
        />
      )}
    </motion.div>
  );
}
