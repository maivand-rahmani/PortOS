# Roadmap - Project Portfolio OS

> This roadmap tracks every step of the project development, from setup to complete OS functionality. Each step has subtasks and a detailed description. Completed tasks can be marked with [x].

---

## 1. Project Initialization

**Description:** This step sets up the foundation of the project. It ensures the environment, libraries, and project structure are correctly configured to avoid future problems.

* [x] Create Next.js project with latest version

  * [x] Choose App Router

    * **Description:** Determines the routing strategy for the project.
  * [x] Enable Tailwind

    * **Description:** Sets up the utility-first CSS framework for styling.
  * [x] Set up ESLint

    * **Description:** Configures code linting to maintain code quality and consistency.
  * [x] Create src/ directory

    * **Description:** Organizes all source code in a single directory.
* [x] Initialize Git repository

  * **Description:** Allows version control for tracking changes and collaborating if needed.
* [x] Install required libraries

  * [x] clsx (utility for class name management)
  * [x] tailwind-merge (merge Tailwind classes without conflicts)
  * [x] framer-motion (animations)
  * [x] zustand (state management)
  * [x] lucide-react (icons)
* [x] Set up `cn` utility for classNames

  * **Description:** Combines clsx and tailwind-merge to handle dynamic classNames efficiently.
* [x] Verify dev server runs correctly

  * **Description:** Ensures that the development environment is ready and the app runs without errors.

---

## 2. Project Structure Setup (FSD)

**Description:** Organizing the project using Feature-Sliced Design under `src/` to keep the code modular, scalable, and maintainable.

* [x] Create main folders:

  * [x] /src/app (Next.js application layer)
  * [x] /src/processes (system core logic)
  * [x] /src/widgets (UI components like Taskbar, Window)
  * [x] /src/features (user actions and interactions)
  * [x] /src/entities (core entities: windows, apps, processes)
  * [x] /src/shared (shared utilities and UI)
  * [x] /src/apps (application modules)
* [x] Set up OS runtime folder structure

  * [x] /src/processes/os/model

    * **Description:** Contains models for window manager, process manager, and app registry.
* [x] Create `docs/` folder structure

  * [x] /docs/README.md
  * [x] /docs/style

    * [x] README.md (UI and style guidelines)
  * [x] /docs/roadmap

    * [x] README.md (this roadmap)
* [x] Add folder documentation for this step

  * [x] Every created source folder includes a `README.md`
  * [x] Every created folder README explains what the folder owns and what its direct children do

---

## 3. System Core - OS

**Description:** Build the main operating system logic that controls windows, apps, and processes, providing the framework for the entire OS simulation.

* [x] Implement Window Manager

  * [x] Create typed window state model and open/focus/close runtime helpers

  * **Description:** Handles all windows' open/close actions, focus, and layering.
* [x] Implement Process Manager

  * [x] Create typed process state model with process lifecycle helpers

  * **Description:** Tracks active applications and processes in the system.
* [x] Implement App Registry

  * [x] Register typed apps from `src/apps/`
  * [x] Load app UI lazily through the registry

  * **Description:** Dynamically loads applications from the `src/apps/` folder and keeps metadata.
* [x] Implement runtime integration shell for verification

  * [x] Connect the runtime to the homepage through a desktop shell widget
  * [x] Validate the runtime with an example app module

---

## 4. First Applications Setup

**Description:** Create the first modular app to test OS integration, ensuring that applications load correctly and behave as expected.

* [x] Create example application template

  * index.js with exportable appConfig
  * UI folder
  * Model folder
  * Icon file
* [x] Test app load in system

  * **Description:** Ensures the OS can dynamically load and render the app.
* [x] Implement drag functionality

  * [x] Mousedown, Mousemove, Mouseup
  * [x] Offset calculation
  * [x] Performance optimization
  * **Description:** Provides realistic window dragging behavior with smooth animations and minimal performance impact.

---

## 5. Styling and Design

**Description:** Define a consistent visual style using Tailwind CSS and CSS variables. Ensure all UI components adhere to the defined style guide.

* [x] Define CSS variables in globals.css
* [x] Map CSS variables into the Tailwind theme layer
* [x] Ensure all UI follows `docs/style/README.md`
* [x] Implement `cn` utility for consistent class management
* [x] Add Framer Motion animations for window transitions and interactions

  * **Description:** Smooth animations improve user experience and make the OS feel realistic.

---

## 6. Window Manager Enhancements

**Description:** Enhance window system behavior to feel more like a real OS.

* [x] Track multiple open windows
* [x] Implement layering (bring to front)
* [x] Persist temporary window positions
* [x] Ensure smooth drag experience
* [x] Add minimize/maximize/close buttons
* [x] Support launch-maximized apps where needed

---

## 7. Applications Expansion

**Description:** Populate the OS with multiple apps, ensuring modularity, isolation, and proper functionality.

* [ ] Add first batch of apps
  - [x] (easy-medium) system info (displays runtime state and allows real process termination)
  - [x] (easy) terminal (runs basic commands, basic navigation, and can open OS apps with `open <app-id>`)
  - [x] (hard) portfolio (app showcasing projects)
  - [x] (hard) resume (interactive resume)
  - [x] (easy) docs (project documentation viewer)
  - [x] (easy) blog (personal blog reader)
  - [x] (easy) contact (contact form and info)
  - [x] (hard) AI agent (interactive assistant app that answers from project/profile context and can open apps)
    * description: This app will be an AI assistant that can read the project documentation and answer questions about the project, as well as perform simple tasks like opening other apps. It will be integrated with the OS interface and will provide an interactive way for users to learn about the project and navigate the OS. it will to a ai model from openrouter and will read the `docs/project`
    `docs/maivand/info.json` folder for context to answer questions about the project and about my projects and portfolio.
  - [x] (easy) calculator (simple calculator app)
  - [x] (easy) notes (note-taking app)
  - [ ] (medium) weather (weather forecast app)
  - [x] (easy) clock (world clock app)
* [x] Test dynamic loading and removal for the easy app set
* [x] Implement app-specific features for the easy app set
* [x] Icons and visual representation
* [ ] Ensure app isolation

Current installed app reality:

- implemented: ai-agent, terminal, docs, blog, contact, portfolio, resume, system-info, calculator, notes, clock, settings
- not implemented yet: weather

---

## 8. AI Agent Integration

**Description:** Integrate an AI assistant that reads project Docs and responds to queries from users, acting as an interactive guide within the OS.

* [x] Prepare AGENTS.md for context
* [x] Implement agent reading `docs/` folder
* [x] Configure agent to answer questions based on project info
* [x] Integrate with OS interface
* [x] Test queries and responses
* [x] Add hiring/client-facing UX for the agent
* [x] Add shell-level AI attraction widget
* [x] Add guided portfolio and contact flows
* [x] Allow the agent to create note drafts in Notes
* [x] Add movable desktop AI widget behavior
* [x] Add local history reset inside the agent

Notes on the current AI agent state:

- the agent is now part of the portfolio conversion flow, not just a docs chatbot
- it acts as a representation of Maivand inside the OS
- it can trigger app-opening flows and guided recruiter/client journeys
- the shell highlights it with a visible draggable widget on desktop load

---

## 9. Final Polishing

**Description:** Refine interactions, ensure style consistency, optimize performance, and finalize documentation.

* [ ] Review window animations and interactions
* [ ] Ensure style consistency across apps with different personalities
* [ ] Test responsiveness and performance
* [ ] Clean up code and interaction edge cases
* [x] Document development decisions in Roadmap

Current in-progress runtime upgrade:

- [ ] Phase 1 spaces rollout
  - [x] dynamic fullscreen workspaces can now be created from the green window control
  - [x] fullscreen state is persisted in the session snapshot and migrated from older snapshots
  - [x] workspace navigation now supports desktop and fullscreen spaces in one ordered strip
  - [x] shell chrome can auto-hide in fullscreen and reveal from top/bottom screen edges
  - [ ] split view and Mission Control remain pending phases

---

## 10. Settings App Overhaul

**Description:** Replace the stub Settings app with a fully functional, production-quality preferences panel with real behavior for every control.

* [x] Fix wallpaper rendering bug — `DesktopWallpaper` was using `-z-10` which placed it behind the solid parent background. Fixed by removing `-z-10` so the wallpaper renders above the parent background color.
* [x] Add custom wallpaper support — file input with `FileReader`, stored as Data URL in IDB metadata store under key `custom-wallpaper`.
* [x] Define `OSSettings` type and `DEFAULT_OS_SETTINGS` in `src/apps/settings/model/settings.types.ts`.
* [x] Add IDB persistence layer in `src/apps/settings/model/settings.idb.ts` (`loadSettings`, `saveSettings`, `loadCustomWallpaper`, `saveCustomWallpaper`).
* [x] Extend `useOSStore` with `osSettings`, `customWallpaperDataUrl`, `hydrateSettings()`, `updateSettings()`, `setCustomWallpaper()`.
* [x] Add `applySettingsToDOM()` helper — applies color scheme (`data-theme`), accent color (`--accent`), dock icon size (`--dock-icon-size`), and reduced transparency (`data-reduced-transparency`) to `document.documentElement`.
* [x] Wire `hydrateSettings()` during boot sequence in `use-desktop-shell.ts`.
* [x] Add dark mode CSS variant and dark token block to `globals.css` using `@custom-variant dark`.
* [x] Add `--dock-icon-size` CSS variable and map into Tailwind `@theme inline`.
* [x] Update `DockAppButton` to use `h-[var(--dock-icon-size)] w-[var(--dock-icon-size)]` instead of hardcoded `h-14 w-14`.
* [x] Update `MacDock` to accept and apply `autohide` prop.
* [x] Wire `autohide` from `osSettings.dockAutohide` in `desktop-root.tsx`.
* [x] Create `use-settings-app.ts` hook — reads store, exposes typed updaters, `exportVfs`, `clearVfs`, `resetSettings`.
* [x] Build 6 real settings sections:
  * `WallpaperSection` — predefined grid + custom image upload tile
  * `AppearanceSection` — Light/Dark/Auto scheme pills, 6 accent swatches, reduce transparency toggle
  * `DockSection` — icon size segmented control + autohide toggle
  * `AccessibilitySection` — reduce motion + reduce transparency toggles
  * `StorageSection` — VFS stats, export to JSON, clear all with confirm dialog
  * `GeneralSection` — live runtime stats, reset settings to defaults
* [x] Rebuild `settings-app.tsx` with sidebar navigation and Framer Motion section transitions.
* [x] Increase settings window to 900×600 (min 680×480).



* Use `[x]` for done steps
* Add notes for subtasks where needed
* Update roadmap as new features or apps are added
