"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CheckSquare,
   Clock3,
  Copy,
   NotebookPen,
   Pin,
   Search,
   StickyNote,
   Tag,
  Trash2,
} from "lucide-react";

import type { AppComponentProps } from "@/entities/app";
import {
  AGENT_NOTES_PREFILL_EVENT,
  NOTES_EXTERNAL_REQUEST_EVENT,
  consumeAgentNotesPrefill,
  consumeNotesExternalRequest,
  type AgentNotesPrefillDetail,
  cn,
} from "@/shared/lib";

import {
  buildNoteExcerpt,
  buildNoteChecklistProgress,
  createPrefilledNote,
  createNoteItem,
  duplicateNoteItem,
  formatNoteDate,
  readStoredNotes,
  saveNotes,
  type NoteItem,
  updateNoteTimestamp,
} from "../model/notes-storage";
import {
  applyNotesExternalRequest,
  type NotesExternalRequestDetail,
} from "../model/notes-external-request";

const wobbleRadii = {
  shell: "32px 18px 28px 16px / 18px 26px 18px 28px",
  card: "26px 14px 24px 18px / 16px 24px 14px 28px",
  chip: "999px 22px 999px 18px / 18px 999px 20px 999px",
  note: "18px 42px 24px 38px / 42px 24px 36px 20px",
  sheet: "28px 18px 24px 16px / 14px 22px 18px 28px",
  tape: "12px 14px 10px 15px / 8px 11px 7px 12px",
};

const cardRotations = ["rotate-[-0.8deg]", "rotate-[0.6deg]", "rotate-[-1.2deg]", "rotate-[0.9deg]"];

type NoteView = "all" | "pinned" | "untagged";

export function NotesApp({ windowId }: AppComponentProps) {
  const [initialNotes] = useState<NoteItem[]>(() => readStoredNotes());
  const [notes, setNotes] = useState<NoteItem[]>(initialNotes);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(initialNotes[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [selectedView, setSelectedView] = useState<NoteView>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState("Saved locally");
  const reduceMotion = useReducedMotion();

  const availableTags = useMemo(
    () => Array.from(new Set(notes.flatMap((note) => note.tags))).sort((left, right) => left.localeCompare(right)),
    [notes],
  );

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const matching = notes.filter((note) => {
      const matchesQuery = !normalizedQuery
        ? true
        : [note.title, note.body, ...note.tags].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesView =
        selectedView === "all"
          ? true
          : selectedView === "pinned"
            ? note.isPinned
            : note.tags.length === 0;
      const matchesTag = selectedTag ? note.tags.includes(selectedTag) : true;

      return matchesQuery && matchesView && matchesTag;
    });

    return [...matching].sort((left, right) => {
      if (left.isPinned !== right.isPinned) {
        return Number(right.isPinned) - Number(left.isPinned);
      }

      return right.updatedAt.localeCompare(left.updatedAt);
    });
  }, [notes, query, selectedTag, selectedView]);

  const selectedNoteId = filteredNotes.some((note) => note.id === activeNoteId)
    ? activeNoteId
    : filteredNotes[0]?.id ?? notes[0]?.id ?? null;

  const activeNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? notes[0] ?? null,
    [notes, selectedNoteId],
  );
  const activeChecklistProgress = useMemo(
    () => (activeNote ? buildNoteChecklistProgress(activeNote.body) : null),
    [activeNote],
  );

  const pinnedCount = notes.filter((note) => note.isPinned).length;
  const untaggedCount = notes.filter((note) => note.tags.length === 0).length;

  const updateNotes = (updater: (current: NoteItem[]) => NoteItem[]) => {
    setNotes((current) => {
      const next = updater(current);
      saveNotes(next);
      setSaveStatus("Saved locally");
      return next;
    });
  };

  useEffect(() => {
    const applyPrefill = (detail: AgentNotesPrefillDetail | null) => {

      if (!detail) {
        return;
      }

      const nextNote = createPrefilledNote({
        title: detail.title,
        body: detail.body,
        tags: detail.tags,
        pinned: detail.pinned,
      });

      updateNotes((current) => [nextNote, ...current]);
      setActiveNoteId(nextNote.id);
      setSaveStatus("Draft added from AI agent");
    };

    const handleAgentPrefill = (event: Event) => {
      applyPrefill((event as CustomEvent<AgentNotesPrefillDetail>).detail);
    };

    applyPrefill(consumeAgentNotesPrefill());

    window.addEventListener(AGENT_NOTES_PREFILL_EVENT, handleAgentPrefill);

    return () => {
      window.removeEventListener(AGENT_NOTES_PREFILL_EVENT, handleAgentPrefill);
    };
  }, []);

  const updateActiveNote = (updater: (note: NoteItem) => NoteItem, status = "Saved locally") => {
    if (!activeNote) {
      return;
    }

    updateNotes((current) =>
      current.map((note) => (note.id === activeNote.id ? updateNoteTimestamp(updater(note)) : note)),
    );
    setSaveStatus(status);
  };

  const createNote = () => {
    const nextNote = createNoteItem(notes.length);

    updateNotes((current) => [nextNote, ...current]);
    setActiveNoteId(nextNote.id);
    setSaveStatus("Fresh page added");
  };

  const duplicateActiveNote = useCallback(() => {
    if (!activeNote) {
      return;
    }

    const nextNote = duplicateNoteItem(activeNote);

    updateNotes((current) => [nextNote, ...current]);
    setActiveNoteId(nextNote.id);
    setSaveStatus("Page duplicated");
  }, [activeNote]);

  const insertChecklistStarter = () => {
    if (!activeNote) {
      return;
    }

    const starter = ["- [ ] Capture next action", "- [ ] Add one follow-up detail", "- [ ] Mark complete when done"].join(
      "\n",
    );

    updateActiveNote(
      (note) => ({
        ...note,
        body: note.body.trim() ? `${note.body.trimEnd()}\n\n${starter}` : starter,
      }),
      "Checklist starter added",
    );
  };

  const deleteActiveNote = () => {
    if (!activeNote) {
      return;
    }

    const remainingNotes = notes.filter((note) => note.id !== activeNote.id);
    const fallbackNotes = remainingNotes.length > 0 ? remainingNotes : [createNoteItem(0)];

    saveNotes(fallbackNotes);
    setNotes(fallbackNotes);
    setActiveNoteId(fallbackNotes[0]?.id ?? null);
    setSaveStatus("Page removed");
  };

  useEffect(() => {
    const applyExternalRequest = (detail: NotesExternalRequestDetail | null) => {
      if (!detail) {
        return;
      }

      let nextActiveNoteId: string | null = null;

      updateNotes((current) => {
        const result = applyNotesExternalRequest(current, detail);

        nextActiveNoteId = detail.selectAfterWrite === false ? null : result.note.id;

        return result.notes;
      });

      if (nextActiveNoteId) {
        setActiveNoteId(nextActiveNoteId);
      }

      setSaveStatus(
        detail.mode === "upsert"
          ? `Updated from ${detail.source ?? "external request"}`
          : `Added from ${detail.source ?? "external request"}`,
      );
    };

    const handleExternalRequest = (event: Event) => {
      const detail = (event as CustomEvent<NotesExternalRequestDetail>).detail;

      if (detail.targetWindowId && detail.targetWindowId !== windowId) {
        return;
      }

      applyExternalRequest(detail);
    };

    applyExternalRequest(consumeNotesExternalRequest(windowId));
    window.addEventListener(NOTES_EXTERNAL_REQUEST_EVENT, handleExternalRequest);

    return () => {
      window.removeEventListener(NOTES_EXTERNAL_REQUEST_EVENT, handleExternalRequest);
    };
  }, [windowId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.shiftKey || event.altKey) {
        return;
      }

      if (event.key.toLowerCase() !== "d" || !activeNote) {
        return;
      }

      const target = event.target;

      if (target instanceof HTMLElement) {
        const tagName = target.tagName.toLowerCase();

        if (tagName === "input" || tagName === "textarea" || target.isContentEditable) {
          return;
        }
      }

      event.preventDefault();
      duplicateActiveNote();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeNote, duplicateActiveNote]);

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, scale: 0.97, y: 18, rotate: -1.2 }}
      animate={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className={cn("notes-app flex h-full flex-col overflow-auto p-3 md:p-4 font-handwriting")}
    >
      <div
        className="flex  h-full flex-1 flex-col border-[3px] border-[#2d2d2d] bg-[#fdfbf7] shadow-[8px_8px_0px_0px_#2d2d2d]"
        style={{ borderRadius: wobbleRadii.shell }}
      >
        <header className="relative border-b-[3px] border-dashed border-[#2d2d2d] px-4 py-4 md:px-6">
          <div
            className="absolute left-6 top-[-10px] h-6 w-24 bg-black/10 opacity-70"
            style={{ borderRadius: wobbleRadii.tape, transform: "rotate(-4deg)" }}
          />
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="inline-flex items-center gap-2 border-[3px] border-[#2d2d2d] bg-[#fff9c4] px-4 py-1 text-[13px] uppercase tracking-[0.18em] text-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d]"
                  style={{ borderRadius: wobbleRadii.chip, transform: "rotate(-2deg)" }}
                >
                  <NotebookPen className="h-4 w-4" strokeWidth={2.5} />
                  Notes room
                </span>
                <span className="text-sm text-[#2d2d2d]/70">Window {windowId.slice(0, 4)}</span>
              </div>

              <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0">
                  <h2 className={cn("text-4xl leading-none text-[#2d2d2d] md:text-5xl font-marker")}>
                    Scribbles, plans, and half-finished thoughts.
                  </h2>
                  <p className="mt-3 max-w-2xl text-lg leading-7 text-[#2d2d2d]/75 md:text-xl">
                    Keep quick capture pages, pin the important ones, sort the pile with tags, and track checklists inline.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={createNote}
                  className="min-h-[48px] cursor-pointer border-[3px] border-[#2d2d2d] bg-[#ff4d4d] px-5 py-2 text-lg text-white shadow-[4px_4px_0px_0px_#2d2d2d] transition duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#2d2d2d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2d5da1]/25 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                  style={{ borderRadius: wobbleRadii.chip }}
                >
                  New page
                </button>
              </div>
            </div>

            <label
              className="relative flex min-h-[52px] items-center border-[3px] border-[#2d2d2d] bg-white px-4 shadow-[4px_4px_0px_0px_#2d2d2d]"
              style={{ borderRadius: wobbleRadii.card, transform: "rotate(1deg)" }}
            >
              <Search className="h-5 w-5 shrink-0 text-[#2d5da1]" strokeWidth={2.5} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search titles, body text, or tags"
                className="w-full border-0 bg-transparent px-3 text-lg text-[#2d2d2d] outline-none placeholder:text-[#2d2d2d]/45"
              />
            </label>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col gap-4 border-b-[3px] border-dashed border-[#2d2d2d] bg-[#f7f0e6] p-4 xl:border-b-0 xl:border-r-[3px]">
            <div
              className="border-[3px] border-[#2d2d2d] bg-white p-4 shadow-[4px_4px_0px_0px_#2d2d2d]"
              style={{ borderRadius: wobbleRadii.card }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className={cn("text-2xl text-[#2d2d2d] font-marker")}>Shelf</p>
                  <p className="text-base text-[#2d2d2d]/70">Browse by stack, tags, or loose pages.</p>
                </div>
                <StickyNote className="h-6 w-6 text-[#ff4d4d]" strokeWidth={2.5} />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <ViewChip
                  label="All pages"
                  value={String(notes.length)}
                  isActive={selectedView === "all"}
                  onClick={() => setSelectedView("all")}
                />
                <ViewChip
                  label="Pinned"
                  value={String(pinnedCount)}
                  isActive={selectedView === "pinned"}
                  onClick={() => setSelectedView("pinned")}
                />
                <ViewChip
                  label="Untagged"
                  value={String(untaggedCount)}
                  isActive={selectedView === "untagged"}
                  onClick={() => setSelectedView("untagged")}
                />
              </div>
            </div>

            <div
              className="border-[3px] border-[#2d2d2d] bg-[#fff9c4] p-4 shadow-[4px_4px_0px_0px_#2d2d2d]"
              style={{ borderRadius: wobbleRadii.card, transform: "rotate(-1deg)" }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className={cn("text-2xl text-[#2d2d2d] font-marker")}>Tags</p>
                  <p className="text-base text-[#2d2d2d]/70">Tap one to slice the current pile.</p>
                </div>
                <Tag className="h-5 w-5 text-[#2d5da1]" strokeWidth={2.5} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <FilterChip label="All tags" isActive={selectedTag === null} onClick={() => setSelectedTag(null)} />
                {availableTags.map((tag) => (
                  <FilterChip key={tag} label={tag} isActive={selectedTag === tag} onClick={() => setSelectedTag(tag)} />
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto pr-1">
              <div className="space-y-4">
                {filteredNotes.length > 0 ? (
                  filteredNotes.map((note, index) => {
                    const isActive = note.id === activeNote?.id;

                    return (
                      <motion.button
                        key={note.id}
                        layout={!reduceMotion}
                        type="button"
                        onClick={() => setActiveNoteId(note.id)}
                        className={cn(
                          "relative w-full cursor-pointer border-[3px] border-[#2d2d2d] px-4 py-4 text-left shadow-[4px_4px_0px_0px_#2d2d2d] transition duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2d5da1]/25 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#2d2d2d]",
                          cardRotations[index % cardRotations.length],
                          isActive ? "bg-[#ffffff]" : "bg-[#fff8ef]",
                        )}
                        style={{ borderRadius: wobbleRadii.note }}
                      >
                        <div
                          className="absolute right-4 top-[-9px] h-5 w-16 bg-black/10"
                          style={{ borderRadius: wobbleRadii.tape, transform: "rotate(7deg)" }}
                        />
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className={cn("truncate text-2xl text-[#2d2d2d] font-marker")}>
                              {note.title || "Untitled note"}
                            </p>
                            <p className="mt-1 text-base text-[#2d2d2d]/65">Updated {formatNoteDate(note.updatedAt)}</p>
                          </div>
                          {note.isPinned ? <Pin className="mt-1 h-5 w-5 shrink-0 text-[#ff4d4d]" strokeWidth={2.5} /> : null}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {note.tags.length > 0 ? (
                            note.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="border-[2px] border-[#2d2d2d] bg-[#e8f0ff] px-3 py-1 text-sm text-[#2d5da1]"
                                style={{ borderRadius: wobbleRadii.chip }}
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-base text-[#2d2d2d]/55">No tags yet</span>
                          )}
                        </div>
                        <p className="mt-3 line-clamp-3 text-lg leading-7 text-[#2d2d2d]/75">
                          {buildNoteExcerpt(note.body) || "Start writing to fill this page with something useful."}
                        </p>
                      </motion.button>
                    );
                  })
                ) : (
                  <div
                    className="border-[3px] border-dashed border-[#2d2d2d] bg-white px-4 py-8 text-center shadow-[4px_4px_0px_0px_#2d2d2d]"
                    style={{ borderRadius: wobbleRadii.card }}
                  >
                    <p className={cn("text-2xl text-[#2d2d2d] font-marker")}>Nothing matches this filter.</p>
                    <p className="mt-2 text-lg text-[#2d2d2d]/70">Try another tag, clear the search, or start a fresh page.</p>
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          setSelectedTag(null);
                          setSelectedView("all");
                        }}
                        className="min-h-[44px] cursor-pointer border-[3px] border-[#2d2d2d] bg-[#e5e0d8] px-4 py-2 text-lg text-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] transition duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#2d2d2d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2d5da1]/25"
                        style={{ borderRadius: wobbleRadii.chip }}
                      >
                        Clear filters
                      </button>
                      <button
                        type="button"
                        onClick={createNote}
                        className="min-h-[44px] cursor-pointer border-[3px] border-[#2d2d2d] bg-[#ff4d4d] px-4 py-2 text-lg text-white shadow-[4px_4px_0px_0px_#2d2d2d] transition duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#2d2d2d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2d5da1]/25"
                        style={{ borderRadius: wobbleRadii.chip }}
                      >
                        New page
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col bg-[#fffdf9] p-4 md:p-5">
            {activeNote ? (
              <AnimatePresence mode="wait" initial={false}>
                <motion.article
                  key={activeNote.id}
                  initial={reduceMotion ? undefined : { opacity: 0, x: 28, rotateY: -10 }}
                  animate={reduceMotion ? undefined : { opacity: 1, x: 0, rotateY: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: -18, rotateY: 8 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                  className="relative flex min-h-0 flex-1 flex-col overflow-hidden border-[3px] border-[#2d2d2d] bg-[#fffefb] shadow-[8px_8px_0px_0px_#2d2d2d]"
                  style={{ borderRadius: wobbleRadii.sheet, transformOrigin: "left center" }}
                >
                  <div className="notes-app__page-lines pointer-events-none absolute inset-0 opacity-80" />
                  <div
                    className="pointer-events-none absolute right-6 top-[-11px] h-6 w-24 bg-black/10"
                    style={{ borderRadius: wobbleRadii.tape, transform: "rotate(5deg)" }}
                  />

                  <div className="relative border-b-[3px] border-dashed border-[#2d2d2d] px-5 py-5 md:px-7">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <input
                          value={activeNote.title}
                          onChange={(event) => updateActiveNote((note) => ({ ...note, title: event.target.value }))}
                          placeholder="Untitled page"
                          className={cn(
                            "w-full border-0 bg-transparent px-0 text-4xl leading-none text-[#2d2d2d] outline-none placeholder:text-[#2d2d2d]/35 md:text-5xl font-marker",
                          )}
                        />
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-base text-[#2d2d2d]/70">
                          <MetaPill icon={<Clock3 className="h-4 w-4" strokeWidth={2.4} />} label={`Created ${formatNoteDate(activeNote.createdAt)}`} />
                          <MetaPill icon={<Clock3 className="h-4 w-4" strokeWidth={2.4} />} label={`Updated ${formatNoteDate(activeNote.updatedAt)}`} />
                          <MetaPill icon={<NotebookPen className="h-4 w-4" strokeWidth={2.4} />} label={saveStatus} />
                        </div>
                      </div>

                       <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={duplicateActiveNote}
                          className="min-h-[44px] cursor-pointer border-[3px] border-[#2d2d2d] bg-white px-4 py-2 text-lg text-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] transition duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#2d2d2d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2d5da1]/25"
                          style={{ borderRadius: wobbleRadii.chip }}
                        >
                          <span className="inline-flex items-center gap-2">
                            <Copy className="h-4 w-4" strokeWidth={2.5} />
                            Duplicate
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateActiveNote(
                              (note) => ({ ...note, isPinned: !note.isPinned }),
                              activeNote.isPinned ? "Page unpinned" : "Page pinned",
                            )
                          }
                          className={cn(
                            "min-h-[44px] cursor-pointer border-[3px] border-[#2d2d2d] px-4 py-2 text-lg shadow-[4px_4px_0px_0px_#2d2d2d] transition duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2d5da1]/25 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#2d2d2d]",
                            activeNote.isPinned ? "bg-[#fff9c4] text-[#2d2d2d]" : "bg-white text-[#2d2d2d]",
                          )}
                          style={{ borderRadius: wobbleRadii.chip }}
                        >
                          <span className="inline-flex items-center gap-2">
                            <Pin className="h-4 w-4" strokeWidth={2.5} />
                            {activeNote.isPinned ? "Pinned" : "Pin page"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={deleteActiveNote}
                          className="min-h-[44px] cursor-pointer border-[3px] border-[#2d2d2d] bg-white px-4 py-2 text-lg text-[#ff4d4d] shadow-[4px_4px_0px_0px_#2d2d2d] transition duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#2d2d2d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2d5da1]/25"
                          style={{ borderRadius: wobbleRadii.chip }}
                        >
                          <span className="inline-flex items-center gap-2">
                            <Trash2 className="h-4 w-4" strokeWidth={2.5} />
                            Delete
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                   <div className="relative border-b-[3px] border-dashed border-[#2d2d2d] px-5 py-4 md:px-7">
                     <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                      <label
                        className="flex min-h-[52px] items-center gap-3 border-[3px] border-[#2d2d2d] bg-white px-4 shadow-[4px_4px_0px_0px_#2d2d2d]"
                        style={{ borderRadius: wobbleRadii.card }}
                      >
                        <Tag className="h-5 w-5 shrink-0 text-[#2d5da1]" strokeWidth={2.5} />
                        <input
                          value={activeNote.tags.join(", ")}
                          onChange={(event) => {
                            const nextTags = event.target.value
                              .split(",")
                              .map((tag) => tag.trim())
                              .filter(Boolean);

                            updateActiveNote((note) => ({ ...note, tags: nextTags }), "Tags updated");
                          }}
                          placeholder="ideas, ui, writing, reminders"
                          className="w-full border-0 bg-transparent text-lg text-[#2d2d2d] outline-none placeholder:text-[#2d2d2d]/45"
                        />
                      </label>

                      <div className="flex flex-wrap gap-2">
                        {activeNote.tags.length > 0 ? (
                          activeNote.tags.map((tag) => (
                            <FilterChip
                              key={tag}
                              label={tag}
                              isActive={selectedTag === tag}
                              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                            />
                          ))
                        ) : (
                          <span className="self-center text-lg text-[#2d2d2d]/55">Add a few tags to sort this page later.</span>
                        )}
                       </div>
                     </div>
                   </div>

                  <div className="relative border-b-[3px] border-dashed border-[#2d2d2d] px-5 py-4 md:px-7">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[#2d2d2d]">
                          <CheckSquare className="h-5 w-5 text-[#2d5da1]" strokeWidth={2.5} />
                          <p className={cn("text-2xl font-marker")}>Checklist pulse</p>
                        </div>
                        {activeChecklistProgress ? (
                          <>
                            <div
                              className="mt-3 h-4 overflow-hidden border-[2px] border-[#2d2d2d] bg-white"
                              style={{ borderRadius: wobbleRadii.chip }}
                            >
                              <motion.div
                                animate={{ width: `${activeChecklistProgress.percent}%` }}
                                transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
                                className="h-full bg-[#32d74b]"
                              />
                            </div>
                            <p className="mt-2 text-lg text-[#2d2d2d]/70">
                              {activeChecklistProgress.completed} of {activeChecklistProgress.total} done, {activeChecklistProgress.remaining} left.
                            </p>
                          </>
                        ) : (
                          <p className="mt-2 text-lg text-[#2d2d2d]/70">
                            Use markdown checklist rows like `- [ ]` and `- [x]` to track progress on the page.
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={insertChecklistStarter}
                        className="min-h-[44px] cursor-pointer border-[3px] border-[#2d2d2d] bg-[#e8f0ff] px-4 py-2 text-lg text-[#2d5da1] shadow-[4px_4px_0px_0px_#2d2d2d] transition duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#2d2d2d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2d5da1]/25"
                        style={{ borderRadius: wobbleRadii.chip }}
                      >
                        <span className="inline-flex items-center gap-2">
                          <CheckSquare className="h-4 w-4" strokeWidth={2.5} />
                          Add checklist starter
                        </span>
                      </button>
                    </div>
                  </div>

                   <div className="relative min-h-0 flex-1 px-5 py-5 md:px-7 md:py-6">
                     <textarea
                      value={activeNote.body}
                      onChange={(event) => updateActiveNote((note) => ({ ...note, body: event.target.value }))}
                      placeholder="Write freely. Draft a plan, dump ideas, or leave yourself a note for later."
                      className="h-full min-h-[280px] w-full resize-none border-0 bg-transparent text-xl leading-9 text-[#2d2d2d] outline-none placeholder:text-[#2d2d2d]/35"
                    />
                  </div>
                </motion.article>
              </AnimatePresence>
            ) : null}
          </section>
        </div>
      </div>
    </motion.div>
  );
}

function ViewChip({
  label,
  value,
  isActive,
  onClick,
}: {
  label: string;
  value: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[64px] cursor-pointer items-center justify-between gap-3 border-[3px] border-[#2d2d2d] px-4 py-3 text-left shadow-[4px_4px_0px_0px_#2d2d2d] transition duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2d5da1]/25 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#2d2d2d]",
        isActive ? "bg-[#ff4d4d] text-white" : "bg-[#fffefb] text-[#2d2d2d]",
      )}
      style={{ borderRadius: wobbleRadii.card }}
    >
      <span className="text-lg">{label}</span>
      <span className="text-xl">{value}</span>
    </button>
  );
}

function FilterChip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-[44px] cursor-pointer border-[3px] border-[#2d2d2d] px-3 py-1 text-base shadow-[4px_4px_0px_0px_#2d2d2d] transition duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2d5da1]/25 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#2d2d2d]",
        isActive ? "bg-[#2d5da1] text-white" : "bg-white text-[#2d2d2d]",
      )}
      style={{ borderRadius: wobbleRadii.chip }}
    >
      {label}
    </button>
  );
}

function MetaPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span
      className="inline-flex min-h-[38px] items-center gap-2 border-[2px] border-[#2d2d2d] bg-[#fff8ef] px-3 py-1.5 text-base text-[#2d2d2d]"
      style={{ borderRadius: wobbleRadii.chip }}
    >
      {icon}
      {label}
    </span>
  );
}
