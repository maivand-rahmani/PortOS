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
* [ ] Set up `cn` utility for classNames

  * **Description:** Combines clsx and tailwind-merge to handle dynamic classNames efficiently.
* [ ] Verify dev server runs correctly

  * **Description:** Ensures that the development environment is ready and the app runs without errors.

---

## 2. Project Structure Setup (FSD)

**Description:** Organizing the project using Feature-Sliced Design to keep the code modular, scalable, and maintainable.

* [ ] Create main folders:

  * [ ] /app (Next.js application layer)
  * [ ] /processes (system core logic)
  * [ ] /widgets (UI components like Taskbar, Window)
  * [ ] /features (user actions and interactions)
  * [ ] /entities (core entities: windows, apps, processes)
  * [ ] /shared (shared utilities and UI)
  * [ ] /apps (application modules)
* [ ] Set up OS runtime folder structure

  * [ ] /processes/os/model

    * **Description:** Contains models for window manager, process manager, and app registry.
* [ ] Create /Docs folder

  * [ ] /Docs/Style

    * [ ] Readme.md (UI and style guidelines)
  * [ ] /Docs/Roadmap

    * [ ] Readme.md (this roadmap)

---

## 3. System Core - OS

**Description:** Build the main operating system logic that controls windows, apps, and processes, providing the framework for the entire OS simulation.

* [ ] Implement Window Manager

  * **Description:** Handles all windows' open/close actions, focus, and layering.
* [ ] Implement Process Manager

  * **Description:** Tracks active applications and processes in the system.
* [ ] Implement App Registry

  * **Description:** Dynamically loads applications from the /apps folder and keeps metadata.

---

## 4. First Applications Setup

**Description:** Create the first modular app to test OS integration, ensuring that applications load correctly and behave as expected.

* [ ] Create example application template

  * index.js with exportable appConfig
  * UI folder
  * Model folder
  * Icon file
* [ ] Test app load in system

  * **Description:** Ensures the OS can dynamically load and render the app.
* [ ] Implement drag functionality

  * Mousedown, Mousemove, Mouseup
  * Offset calculation
  * Performance optimization
  * **Description:** Provides realistic window dragging behavior with smooth animations and minimal performance impact.

---

## 5. Styling and Design

**Description:** Define a consistent visual style using Tailwind CSS and CSS variables. Ensure all UI components adhere to the defined style guide.

* [ ] Define CSS variables in globals.css
* [ ] Map CSS variables into Tailwind config
* [ ] Ensure all UI follows `/Docs/Style/Readme.md`
* [ ] Implement `cn` utility for consistent class management
* [ ] Add Framer Motion animations for window transitions and interactions

  * **Description:** Smooth animations improve user experience and make the OS feel realistic.

---

## 6. Window Manager Enhancements

**Description:** Enhance window system behavior to feel more like a real OS.

* [ ] Track multiple open windows
* [ ] Implement layering (bring to front)
* [ ] Persist temporary window positions
* [ ] Ensure smooth drag experience
* [ ] Add minimize/maximize/close buttons

---

## 7. Applications Expansion

**Description:** Populate the OS with multiple apps, ensuring modularity, isolation, and proper functionality.

* [ ] Add first batch of 10 apps
* [ ] Test dynamic loading and removal
* [ ] Implement app-specific features
* [ ] Icons and visual representation
* [ ] Ensure app isolation

---

## 8. AI Agent Integration

**Description:** Integrate an AI assistant that reads project Docs and responds to queries from users, acting as an interactive guide within the OS.

* [ ] Prepare AGENTS.md for context
* [ ] Implement agent reading `/Docs` folder
* [ ] Configure agent to answer questions based on project info
* [ ] Integrate with OS interface
* [ ] Test queries and responses

---

## 9. Final Polishing

**Description:** Refine interactions, ensure style consistency, optimize performance, and finalize documentation.

* [ ] Review window animations and interactions
* [ ] Ensure style consistency
* [ ] Test responsiveness and performance
* [ ] Clean up code
* [ ] Document development decisions in Roadmap

---

## ✅ Completion Tracking

* Use `[x]` for done steps
* Add notes for subtasks where needed
* Update roadmap as new features or apps are added
