# resume

Interactive resume app built from real profile and project data.

It now supports recruiter-mode resume lenses and an external focus API so other PortOS surfaces can open the app directly into a chosen section, project, or narrative angle.

## Folders and files

- `index.ts`: app metadata and lazy loader.
- `icon.tsx`: Resume app icon.
- `theme.css`: industrial dossier styling, marquee motion, and print helpers.
- `model/`: typed resume content shaping.
- `ui/`: interactive resume dossier interface and recruiter-mode workspace.

## External integration

- `openResumeWithFocus(...)` from `src/shared/lib`: opens/focuses Resume and sends a typed request to the target window.
- `RESUME_FOCUS_REQUEST_EVENT`: lower-level window event used by the helper.

Supported focus request fields:

- `sectionId`: reveal a specific resume section.
- `projectId`: select a timeline project.
- `lensId`: switch to a recruiter-mode lens.
- `source`: optional label shown inside the app for traceability.
