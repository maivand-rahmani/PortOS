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
  /processes
    /os
      /model
        windowManager
        processManager
        appRegistry

  /widgets
  /features
  /entities
  /shared
  /apps
```

---

## ⚙️ Core System Layers

### 1. OS Runtime (`/processes/os`)

This is the heart of the system.

Includes:

* window management
* process tracking
* app launching
* focus handling
* z-index system

All system logic MUST live here.

---

### 2. App System (`/apps`)

Each app is an isolated module.

Structure:

```
/apps
  /exampleApp
    index.js
    ui/
    model/
    icon.svg
```

Each app exports a configuration object:

```js
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

```js
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

The agent MUST always check the `/Docs` folder before making decisions.

### Structure:

```
/Docs
  /Style
    Readme.md

  /Roadmap
    Readme.md
```

---

### 1. Style Documentation (`/Docs/Style/Readme.md`)

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

### 2. Roadmap (`/Docs/Roadmap/Readme.md`)

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

## 🧱 Development Rules

1. Do NOT mix system logic with UI
2. Do NOT let apps control system behavior
3. Do NOT duplicate state
4. Keep modules isolated
5. Follow architecture strictly
6. Always check Docs before implementing

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