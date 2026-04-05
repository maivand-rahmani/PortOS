# ui

Visual building blocks for the macOS-style desktop shell.

## Folders

- `desktop-root/`: top-level shell composition.
- `desktop-wallpaper/`: desktop background and ambient layers.
- `mac-menu-bar/`: persistent top system status bar with app actions, shell indicators, AI access, and fullscreen overlay presentation.
- `desktop-icons/`: desktop icon field and icon composition.
- `desktop-ai-teaser/`: left-side AI attraction widget that launches the agent and guided flows.
- `desktop-icon/`: a single draggable/selectable desktop icon.
- `window-surface/`: floating window frame and content surface, including edge-to-edge fullscreen presentation.
- `window-traffic-button/`: close/minimize/maximize control button.
- `mac-dock/`: dock container and open/minimized app indicators, including fullscreen overlay presentation.
- `dock-app-button/`: dock button for installed apps.
- `dock-minimized-button/`: dock restore button for minimized windows.
- `dock-menu/`: dock context menu for app and window commands.
- `boot-overlay/`: startup overlay shown before the desktop is ready.
- `snap-guide-overlay/`: live snap target preview shown while dragging windows near desktop edges.
- `notification-toasts/`: stacked transient toast surface for incoming system notifications.
- `notification-center-panel/`: right-side persistent notification history panel opened from the menu bar.
- `app-switcher-overlay/`: centered overlay for cycling between running apps from the shell.
- `workspace-switcher/`: compact segmented control for switching virtual desktops and fullscreen spaces.
- `split-view-picker/`: in-pane chooser for selecting the second app when entering split view.
- `split-view-divider/`: draggable divider for resizing left and right split panes.

Each UI folder should stay small and focused on one visible shell responsibility.
