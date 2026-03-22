# ui

Visual building blocks for the macOS-style desktop shell.

## Folders

- `desktop-root/`: top-level shell composition.
- `desktop-wallpaper/`: desktop background and ambient layers.
- `mac-menu-bar/`: top system bar.
- `desktop-icons/`: desktop icon field and icon composition.
- `desktop-icon/`: a single draggable/selectable desktop icon.
- `window-surface/`: floating window frame and content surface.
- `window-traffic-button/`: close/minimize/maximize control button.
- `mac-dock/`: dock container and open/minimized app indicators.
- `dock-app-button/`: dock button for installed apps.
- `dock-minimized-button/`: dock restore button for minimized windows.
- `boot-overlay/`: startup overlay shown before the desktop is ready.

Each UI folder should stay small and focused on one visible shell responsibility.
