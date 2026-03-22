# app

Next.js application layer.

## Files

- `layout.js`: root HTML shell, metadata, and global app wrapper.
- `page.js`: current home route and future OS boot surface.
- `globals.css`: global styles and design-token entrypoint.
- `favicon.ico`: browser tab icon.

This layer owns routing and page composition. System logic belongs in `src/processes/`, not here.
