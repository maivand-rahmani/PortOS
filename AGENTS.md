<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
<!-- BEGIN:portos-project-rules -->
# AGENTS.md

## 🧠 Project Overview

This project is a **browser-based operating system simulation** built with Next.js.

The goal is to create a highly interactive, desktop-like environment that mimics real OS behavior:

* window management
* application system
* process-like state
* dynamic UI interactions

This is NOT a typical website.

This is a **system-driven frontend architecture** where:

* the system controls applications
* applications are isolated modules
* UI reflects runtime state

---

## 🎯 Core Principles

1. The system controls everything — not individual components
2. Applications are modular and isolated
3. State is centralized and predictable
4. UI reflects system state, not the other way around
5. Code must remain scalable and maintainable

---

## 🏗️ Architecture

We use a modified **Feature-Sliced Design (FSD)** architecture.

### Structure:

```
/src
  /app
    README.md
  /processes
    README.md
    /os
      README.md
      /model
        README.md
        /window-manager
          README.md
        /process-manager
          README.md
        /app-registry
          README.md

  /widgets
    README.md
  /features
    README.md
  /entities
    README.md
  /shared
    README.md
    /lib
      README.md
    /ui
      README.md
  /apps
    README.md
```

---

## ⚙️ Core System Layers

### 1. OS Runtime (`/src/processes/os`)

This is the heart of the system.

Includes:

* window management
* process tracking
* app launching
* focus handling
* z-index system

All system logic MUST live here.

---

### 2. App System (`/src/apps`)

Each app is an isolated module.

Structure:

```
/src/apps
  /example-app
    README.md
    index.ts
    ui/
    model/
    icon.svg
```

Each app exports a configuration object:

```ts
export const appConfig = {
  id: "example",
  name: "Example App",
  icon,
  load: async () => {
    return {
      component: ExampleComponent
    }
  }
}
```

Apps MUST NOT:

* control window state
* know about system internals

---

### 3. Window System

Windows are controlled by the system.

Each window is a runtime instance:

```js
{
  id: "window-id",
  appId: "example",
  position: { x, y },
  zIndex: number,
  isActive: boolean
}
```

---

## 🧠 State Management

We use **Zustand**.

The runtime implementation should use **TypeScript** for system models, stores, entities, and application modules.

Global state includes:

* windows
* active window
* processes
* system storage (future)

Rules:

* single source of truth
* no duplicated state
* predictable updates only

---

## 🖱️ Drag and Drop System

We implement a **custom drag system** using native events:

* mousedown
* mousemove
* mouseup

Rules:

* drag only from window header
* calculate cursor offset correctly
* update position efficiently
* avoid unnecessary re-renders

Performance is critical.

---

## 🎨 Styling System

We use **Tailwind CSS + CSS Variables**

### Key Rule:

All design tokens MUST be defined as CSS variables.

---

### Example:

#### globals.css

```css
:root {
  --color-bg: #0f0f0f;
  --color-primary: #3b82f6;
}
```

---

### Tailwind config:

```js
theme: {
  extend: {
    colors: {
      background: "var(--color-bg)",
      primary: "var(--color-primary)"
    }
  }
}
```

---

### Usage:

```jsx
<div className="bg-background text-primary" />
```

---

## ❗ Important

DO NOT use inline CSS variables like:

```jsx
bg-[var(--color-bg)]
```

Always map variables into Tailwind config.

---

## 🧩 Utility Functions

We use a shared utility:

```ts
cn(...inputs)
```

Which combines:

* clsx
* tailwind-merge

Purpose:

* clean className logic
* prevent Tailwind conflicts

---

## 🎞️ Animations

We use **Framer Motion**

Used for:

* window open/close
* transitions
* micro-interactions

Animations should feel smooth and responsive.

---

## 📚 Documentation System (CRITICAL)

The agent MUST always check the `docs/` folder before making decisions.

### Structure:

```
/docs
  README.md
  /style
    README.md

  /roadmap
    README.md
```

---

### 1. Style Documentation (`docs/style/README.md`)

Contains:

* UI/UX rules
* design principles
* visual system
* interaction patterns

Rules:

* ALWAYS follow style guidelines
* DO NOT invent new styles
* DO NOT break consistency

---

### 2. Roadmap (`docs/roadmap/README.md`)

Contains:

* current development stage
* next steps
* priorities
* completed tasks

Rules:

* ALWAYS check current step before coding
* DO NOT implement features outside roadmap
* FOLLOW the defined sequence

---

### 3. Folder Documentation Rule

Every non-generated, project-owned folder MUST include a `README.md`.

Each folder README must explain:

* what the folder owns
* what each direct child folder or key file does
* where related logic should live when that boundary matters

Rules:

* create or update the folder `README.md` in the same change that creates or changes the folder
* keep folder documentation short, specific, and accurate
* do not leave source, docs, app, widget, feature, entity, process, or shared folders undocumented

---

### 4. TypeScript Rule

Project-owned source code must use TypeScript.

Rules:

* use `.ts` for non-visual modules and `.tsx` for React components
* prefer typed entities, store contracts, and runtime helpers over implicit shapes
* do not add new `.js` or `.jsx` source files in `src/` unless the file is generated by a tool outside our control

---

## 🧱 Development Rules

1. Do NOT mix system logic with UI
2. Do NOT let apps control system behavior
3. Do NOT duplicate state
4. Keep modules isolated
5. Follow architecture strictly
6. Always check `docs/` before implementing
7. Every non-generated, project-owned folder must have a `README.md`
8. Use TypeScript and TSX for project-owned source files

---

## 🚀 Development Flow

1. Build system core (window manager, registry)
2. Add minimal apps
3. Improve UX and interactions
4. Scale system

---

## 🎯 Goal

The final result should feel like a real operating system:

* smooth interactions
* realistic window behavior
* modular applications
* clean architecture

---

## ⚠️ Final Note

This project prioritizes:

* system design
* architecture clarity
* user experience

Over:

* quick hacks
* shortcuts
* messy implementations

<!-- END:portos-project-rules -->
