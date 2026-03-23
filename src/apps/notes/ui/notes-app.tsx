"use client";

import { useMemo, useState } from "react";

import type { AppComponentProps } from "@/entities/app";

type NoteItem = {
  id: string;
  title: string;
  body: string;
  tags: string[];
};

const STORAGE_KEY = "portos-notes-items";

function createEmptyNote(index: number): NoteItem {
  return {
    id: createNoteId(index),
    title: `Note ${index + 1}`,
    body: "",
    tags: [],
  };
}

function createNoteId(index: number) {
  return `note-${Date.now()}-${index}`;
}

function normalizeNote(note: Partial<NoteItem>, index: number): NoteItem {
  return {
    id: note.id ?? createNoteId(index),
    title: note.title ?? `Note ${index + 1}`,
    body: note.body ?? "",
    tags: Array.isArray(note.tags) ? note.tags.filter(Boolean) : [],
  };
}

function readStoredNotes() {
  if (typeof window === "undefined") {
    return [createEmptyNote(0)];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [createEmptyNote(0)];
  }

  try {
    const parsed = JSON.parse(stored) as Array<Partial<NoteItem>>;
    return parsed.length > 0 ? parsed.map(normalizeNote) : [createEmptyNote(0)];
  } catch {
    return [createEmptyNote(0)];
  }
}

function saveNotes(notes: NoteItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function NotesApp({ windowId }: AppComponentProps) {
  const [initialNotes] = useState<NoteItem[]>(() => readStoredNotes());
  const [notes, setNotes] = useState<NoteItem[]>(initialNotes);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(initialNotes[0]?.id ?? null);

  const selectedNoteId = notes.some((note) => note.id === activeNoteId)
    ? activeNoteId
    : (notes[0]?.id ?? null);

  const activeNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? notes[0] ?? null,
    [notes, selectedNoteId],
  );

  const updateNotes = (updater: (current: NoteItem[]) => NoteItem[]) => {
    setNotes((current) => {
      const next = updater(current);
      saveNotes(next);
      return next;
    });
  };

  return (
    <div className="notes-app grid h-full gap-4 rounded-[24px] p-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="min-h-0 overflow-auto rounded-[24px] bg-white/80 p-4 shadow-panel">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-yellow-700/60">Notes</p>
            <p className="mt-2 text-sm text-yellow-900/60">Window {windowId.slice(0, 4)}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const nextNote = createEmptyNote(notes.length);

              updateNotes((current) => [...current, nextNote]);
              setActiveNoteId(nextNote.id);
            }}
            className="cursor-pointer rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-yellow-950 transition duration-200 hover:bg-yellow-300"
          >
            New
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {notes.map((note) => {
            const isActive = note.id === activeNote?.id;

            return (
              <button
                key={note.id}
                type="button"
                onClick={() => setActiveNoteId(note.id)}
                className={`w-full cursor-pointer rounded-[20px] border px-4 py-4 text-left transition duration-200 ${
                  isActive
                    ? "border-yellow-400 bg-yellow-50 text-yellow-950"
                    : "border-yellow-200 bg-white hover:border-yellow-300 hover:bg-yellow-50/60"
                }`}
              >
                <p className="font-semibold text-slate-950">{note.title || "Untitled note"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {note.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-full bg-yellow-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-yellow-800">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{note.body || "Start writing..."}</p>
              </button>
            );
          })}
        </div>
      </aside>
      <section className="flex min-h-0 flex-col rounded-[24px] bg-white/80 p-5 shadow-panel">
        {activeNote ? (
          <>
            <div className="flex flex-col gap-3 border-b border-yellow-200 pb-4">
              <input
                value={activeNote.title}
                onChange={(event) => {
                  const nextTitle = event.target.value;

                  updateNotes((current) =>
                    current.map((note) =>
                      note.id === activeNote.id
                        ? { ...note, title: nextTitle }
                        : note,
                    ),
                  );
                }}
                placeholder="Note title"
                className="rounded-[18px] border border-yellow-200 bg-white px-4 py-3 text-lg font-semibold text-slate-950 outline-none focus:ring-2 focus:ring-yellow-400/60"
              />
              <input
                value={activeNote.tags.join(", ")}
                onChange={(event) => {
                  const nextTags = event.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean);

                  updateNotes((current) =>
                    current.map((note) =>
                      note.id === activeNote.id
                        ? { ...note, tags: nextTags }
                        : note,
                    ),
                  );
                }}
                placeholder="Tags: ideas, ui, todo"
                className="rounded-[18px] border border-yellow-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-yellow-400/60"
              />
              <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                <span>{notes.length} saved notes</span>
                <button
                  type="button"
                  onClick={() => {
                    const remainingNotes = notes.filter((note) => note.id !== activeNote.id);
                    const fallbackNotes = remainingNotes.length > 0 ? remainingNotes : [createEmptyNote(0)];

                    saveNotes(fallbackNotes);
                    setNotes(fallbackNotes);
                    setActiveNoteId(fallbackNotes[0]?.id ?? null);
                  }}
                  className="cursor-pointer rounded-full border border-yellow-300 px-4 py-2 font-semibold text-yellow-900 transition duration-200 hover:bg-yellow-50"
                >
                  Delete
                </button>
              </div>
            </div>
            <textarea
              value={activeNote.body}
              onChange={(event) => {
                const nextBody = event.target.value;

                updateNotes((current) =>
                  current.map((note) =>
                    note.id === activeNote.id
                      ? { ...note, body: nextBody }
                      : note,
                  ),
                );
              }}
              placeholder="Write notes here..."
              className="mt-4 min-h-0 flex-1 resize-none rounded-[24px] border border-yellow-200 bg-white p-5 text-base leading-7 text-slate-700 outline-none focus:ring-2 focus:ring-yellow-400/60"
            />
          </>
        ) : null}
      </section>
    </div>
  );
}
