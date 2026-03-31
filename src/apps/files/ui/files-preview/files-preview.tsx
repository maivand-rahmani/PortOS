"use client";

import { useCallback, useEffect, useState } from "react";

import { File, X } from "lucide-react";

import type { FileSystemNode } from "@/entities/file-system";
import { isTextMime } from "@/entities/file-system";
import { cn } from "@/shared/lib";

import { formatFileSize, formatNodeDate, NodeIcon } from "../files-shared/files-shared";

type FilesPreviewProps = {
  node: FileSystemNode;
  onClose: () => void;
  readContent: (nodeId: string) => Promise<string | null>;
};

export function FilesPreview({ node, onClose, readContent }: FilesPreviewProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (node.type !== "file") {
      setContent(null);

      return;
    }

    if (!isTextMime(node.mimeType)) {
      setContent(null);

      return;
    }

    let cancelled = false;

    setLoading(true);

    readContent(node.id).then((data) => {
      if (!cancelled) {
        setContent(data);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [node, readContent]);

  const isFile = node.type === "file";
  const canPreview = isFile && isTextMime(node.mimeType);

  return (
    <div className="flex h-full w-[var(--files-preview-width)] flex-col border-l border-[var(--files-border)] bg-[var(--files-sidebar-bg)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--files-border)] px-3 py-2">
        <span className="text-[12px] font-medium text-[var(--files-text)]">
          Preview
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-5 w-5 items-center justify-center rounded text-[var(--files-text-secondary)] hover:bg-[var(--files-hover)] hover:text-[var(--files-text)]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Icon + metadata */}
      <div className="flex flex-col items-center gap-2 px-4 py-4">
        <NodeIcon node={node} size={56} />

        <div className="text-center">
          <p className="text-[13px] font-medium text-[var(--files-text)]">
            {node.name}
          </p>
          <p className="text-[11px] text-[var(--files-text-secondary)]">
            {node.type === "directory" ? "Folder" : node.extension.toUpperCase() || "File"}
          </p>
        </div>

        <div className="mt-1 w-full space-y-1 text-[11px]">
          {isFile && (
            <MetaRow label="Size" value={formatFileSize(node.size)} />
          )}
          <MetaRow label="Modified" value={formatNodeDate(node.updatedAt)} />
          <MetaRow label="Created" value={formatNodeDate(node.createdAt)} />
          {isFile && (
            <MetaRow label="Type" value={node.mimeType} />
          )}
        </div>
      </div>

      {/* Content preview */}
      {canPreview && (
        <div className="flex min-h-0 flex-1 flex-col border-t border-[var(--files-border)]">
          <div className="px-3 py-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--files-text-secondary)]">
              Content
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
            {loading ? (
              <p className="text-[11px] text-[var(--files-text-secondary)]">
                Loading...
              </p>
            ) : content !== null ? (
              <pre className="whitespace-pre-wrap break-words text-[11px] leading-relaxed text-[var(--files-text)]">
                {content.slice(0, 4000)}
                {content.length > 4000 && (
                  <span className="text-[var(--files-text-secondary)]">
                    {"\n\n"}... ({formatFileSize(content.length - 4000)} more)
                  </span>
                )}
              </pre>
            ) : (
              <p className="text-[11px] text-[var(--files-text-secondary)]">
                No content
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[var(--files-text-secondary)]">{label}</span>
      <span className="truncate text-right text-[var(--files-text)]" title={value}>
        {value}
      </span>
    </div>
  );
}
