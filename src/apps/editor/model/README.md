# Editor Model

State management and pure logic for the Editor app.

## Files

| File | Purpose |
|------|---------|
| `editor.types.ts` | Types (`EditorMode`, `EditorDocument`, `EditorState`, `UndoEntry`), mode detection, text stats, document factory, constants |
| `editor-ai-context.ts` | Builds the live Editor window context published to the OS AI service |
| `use-editor.ts` | Main React hook — file open/save, undo/redo, auto-save, keyboard shortcuts, markdown insert helpers, `OpenFileRequest` consumption |
