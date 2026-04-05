# app

Next.js application layer.

## Files

- `layout.tsx`: root HTML shell, metadata, and offline-safe global font-variable setup.
- `page.tsx`: boots the desktop shell widget.
- `globals.css`: global styles and design-token entrypoint.
- `api/`: route handlers for app data and server-side integrations.
- `favicon.ico`: browser tab icon.

This layer owns routing and page composition. System logic belongs in `src/processes/`, not here.
