/**
 * Transcript persistence helpers for the AI service.
 *
 * Transcripts are stored as per-session JSON files under
 * /System/user/ai/transcripts/ in the virtual filesystem.
 */

import type {
  AiTranscriptEntry,
  AiTranscriptFile,
  AiServiceRequest,
  AiServiceResult,
} from "./ai-service.types";

/** Maximum number of transcript files to keep. Oldest are pruned. */
export const MAX_TRANSCRIPT_FILES = 50;

/** Build a transcript file name from a session ID. */
export function buildTranscriptFileName(sessionId: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  return `${timestamp}_${sessionId}.json`;
}

/** Build the full path for a transcript file. */
export function buildTranscriptPath(fileName: string): string {
  return `/System/user/ai/transcripts/${fileName}`;
}

/** Create a new empty transcript file object. */
export function createTranscriptFile(sessionId: string): AiTranscriptFile {
  return {
    sessionId,
    startedAt: new Date().toISOString(),
    entries: [],
  };
}

/** Build a transcript entry from a request and its result. */
export function buildTranscriptEntry(
  sessionId: string,
  request: AiServiceRequest,
  result: AiServiceResult | null,
  error?: string,
): AiTranscriptEntry {
  return {
    id: `transcript-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sessionId,
    request,
    result,
    error,
    createdAt: new Date().toISOString(),
  };
}

/** Append an entry to a transcript file. */
export function appendToTranscript(
  transcript: AiTranscriptFile,
  entry: AiTranscriptEntry,
): AiTranscriptFile {
  return {
    ...transcript,
    entries: [...transcript.entries, entry],
  };
}

/** Serialize a transcript to JSON. */
export function serializeTranscript(transcript: AiTranscriptFile): string {
  return JSON.stringify(transcript, null, 2);
}
