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
6. No mock interactions in shipped UI

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
    /desktop-shell
      README.md
      index.ts
      /model
        README.md
      /ui
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

Apps SHOULD follow the same modular structure as widgets whenever they grow beyond a single small component.

Apps MUST provide real behavior for every visible control. Do not add buttons, menu items, toggles, command rows, or panels that do nothing.

If a feature cannot be implemented with real logic yet, do not add the UI for it.

Prototype-only placeholder apps are not allowed in the main app registry.

---

### App Icon Design System

Every app MUST have a custom SVG icon component at `src/apps/<app>/icon.tsx`.

**Component pattern:**

```tsx
import type { SVGProps } from "react";

export default function AppNameIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        {/* linearGradient for bright, saturated fill matching app tint */}
        <linearGradient id="app-bg" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#bright-variant" />
          <stop offset="100%" stopColor="#base-tint" />
        </linearGradient>
        {/* radialGradient for specular light source (top-left) */}
        <radialGradient id="app-glow" cx="8" cy="7" r="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        {/* filter for depth/glow shadow */}
        <filter id="app-shadow" x="-10%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#base-tint" floodOpacity="0.35" />
        </filter>
      </defs>
      {/* Main shape with gradient fill and shadow */}
      <rect x="..." y="..." width="..." height="..." rx="..." fill="url(#app-bg)" filter="url(#app-shadow)" />
      {/* Specular glow overlay */}
      <rect x="..." y="..." width="..." height="..." rx="..." fill="url(#app-glow)" />
      {/* Detail strokes with light colors */}
      <path d="..." stroke="#light-variant" strokeWidth="1.6" strokeLinecap="round" />
      {/* Glass reflection highlight (top-left corner) */}
      <rect x="2" y="3" width="10" height="7" rx="3" fill="white" opacity="0.14" />
    </svg>
  );
}
```

**Liquid Glass style rules:**

- Use `linearGradient` for bright, saturated fills matching the app's tint color
- Use `radialGradient` with `cx="8" cy="7"` for specular light source (top-left, Apple-style)
- Use `filter` with `feDropShadow` for depth/glow using the app's tint as flood color
- Add a semi-transparent white `rect` in the top-left corner for glass reflection
- Use secondary strokes with fading `opacity` (0.9, 0.7, 0.55) for depth layering
- All gradient/filter IDs must be unique per icon (prefix with app name: `contact-bg`, `blog-glow`, etc.)
- `viewBox` must be `"0 0 24 24"`, component must accept and spread `SVGProps<SVGSVGElement>`
- Stroke details: `strokeWidth="1.6"`, `strokeLinecap="round"`, `strokeLinejoin="round"`

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

## ✅ Real Logic Requirement

Every application, component, and control added to the desktop must satisfy these rules:

* every button must trigger real logic
* every app in `src/apps/` must own a real use case
* avoid placeholder dashboards that only display fake numbers unless the numbers are derived from real project/runtime state
* avoid placeholder forms unless submission and validation logic are implemented
* avoid fake terminals, fake assistants, fake process tools, and fake calculators
* app visuals may be expressive, but behavior must stay functional and testable

When building apps for this project, prefer fewer fully working apps over many decorative ones.

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

### 5. File Size and Modularization Rule

Project-owned UI and runtime files must stay small, focused, and easy to scale.

Rules:

* do not create giant components or store files that mix many responsibilities
* if a widget, feature, app, or shared component starts owning multiple visual sections or behaviors, split it into a folder with `index.ts`, `ui/`, and `model/`
* each important subcomponent should live in its own folder when it has its own state, interactions, or documentation needs
* prefer composition through small files over one large file with many local helper components
* when a file becomes hard to scan or mixes shell, dock, menu bar, icons, and windows together, break it apart immediately

Recommended pattern:

```ts
/desktop-shell
  README.md
  index.ts
  /model
    README.md
    use-desktop-shell.ts
    desktop-shell.constants.ts
  /ui
    README.md
    /desktop-shell-root
      README.md
      desktop-shell-root.tsx
    /desktop-dock
      README.md
      desktop-dock.tsx
```

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
9. Keep files small and split large widgets/apps into `index.ts`, `ui/`, and `model/` folders

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
