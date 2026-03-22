# app

Next.js application layer.

## Files

- `layout.tsx`: root HTML shell, metadata, and global font setup.
- `page.tsx`: boots the desktop shell widget.
- `globals.css`: global styles and design-token entrypoint.
- `favicon.ico`: browser tab icon.

This layer owns routing and page composition. System logic belongs in `src/processes/`, not here.
