# Settings & Options Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Diagnostics & Settings view into a full-featured "Settings & Options" page with theme modes, font size scaling, conversion defaults, cache clearing, and system diagnostics.

**Architecture:** Create a reactive `settingsStore` (or `SettingsContext`) with persistent `localStorage` serialization. Update root CSS variables/classes on the `<html>` element to apply font scale (Compact, Default, Spacious) and theme (Light, Dark, System). Redesign `SettingsPage.tsx` into a modular tabbed or categorized layout featuring Appearance, Conversion Defaults, Privacy & Cache, and System Diagnostics.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, localStorage API.

---

### Proposed Settings & Options Breakdown

#### 1. 🎨 Appearance & UI Preferences
- **Theme Selection**:
  - `Light Mode` • `Dark Mode` • `System Auto` (listens to OS `prefers-color-scheme`).
- **Font Sizing & UI Scale**:
  - `Compact (92%)`: Higher information density for power users.
  - `Standard (100%)`: Default balanced typography.
  - `Spacious (108%)`: Enhanced legibility and larger touch targets.
- **Motion & Transitions**:
  - `Smooth Animations` (default liquid mesh physics) vs `Reduced Motion` (instant transitions for accessibility and battery savings).

#### 2. ⚡ Conversion Defaults
- **Default Image Quality**:
  - Slider (50% to 100%, default 80%) applied automatically to all new image batch queues.
- **Default Image Target Format**:
  - Select favorite format (`JPG`, `PNG`, `WEBP`, or `Auto-detect`).
- **Aspect Ratio Lock**:
  - Checkbox toggle for whether resize calculations lock aspect ratio by default.
- **Auto-Download on Finish**:
  - Toggle to automatically trigger file download once batch conversion succeeds without clicking "Download".

#### 3. 📄 PDF Studio Preferences
- **Default Export Format**:
  - `Compiled PDF Document` vs `High-Resolution Images ZIP`.
- **Thumbnail Render Density**:
  - `Standard (150 DPI)` vs `Ultra (300 DPI)`.

#### 4. 🧹 Privacy, Cache & Reset
- **Session History & Cache**:
  - Displays total files converted in session.
  - One-click `Clear Recent History & Cache` with instant toast notification.
- **Reset to Factory Defaults**:
  - One-click button to reset all settings to defaults.

#### 5. 🛠️ System Diagnostics & Local Engines
- Keep existing FastAPI core status, backend version, execution mode, and detected local binary codecs (Pillow, pdftoppm, Pandoc, WeasyPrint, openpyxl, etc.) in a dedicated, clean "System Diagnostics" section or tab.

---

### Implementation Tasks

#### Task 1: Create Settings Store & Font Scale Engine
**Files:**
- Create: `frontend/src/utils/settingsStore.ts`
- Modify: `frontend/src/index.css`
- Modify: `frontend/src/App.tsx`

**Step 1: Write Settings Type and Store**
- Implement `AppSettings` interface with default values and `localStorage` getter/setter.
- Export helper functions to apply font size and theme changes directly to `document.documentElement`.

**Step 2: Add CSS Variables for Font Scaling in `index.css`**
- Set `--root-font-scale` or `font-size: var(--root-font-size, 16px)`.

**Step 3: Integrate with App.tsx**
- Load settings on mount and listen to storage/preference changes.

---

#### Task 2: Redesign Sidebar & Command Palette Labels
**Files:**
- Modify: `frontend/src/components/layout/Sidebar.tsx`
- Modify: `frontend/src/components/CommandPalette.tsx`
- Modify: `frontend/src/App.tsx`

**Step 1: Update Sidebar label**
- Change `"Diagnostics & Settings"` to `"Settings & Options"`.
- Use `Sliders` or `Settings2` icon.

**Step 2: Update Command Palette**
- Change title to `"Settings & Options"` with subtitle `"Configure theme, font size, default formats & diagnostics"`.

---

#### Task 3: Build the Redesigned `SettingsPage.tsx`
**Files:**
- Modify: `frontend/src/pages/SettingsPage.tsx`

**Step 1: Implement Category Navigation / Tabs**
- Add category segmented tabs: `Appearance`, `Conversion Defaults`, `Storage & Privacy`, `System Engines`.
- Alternatively, clean grouped card sections on desktop and mobile.

**Step 2: Add Appearance Controls**
- Theme picker (Light, Dark, System) with visual card previews.
- Font scale buttons (Compact 92%, Standard 100%, Spacious 108%) with live instant text preview.
- Reduced motion toggle.

**Step 3: Add Conversion Default Controls**
- Image quality slider with percentage badge.
- Default format select dropdown.
- Auto-download toggle.

**Step 4: Add Storage & Reset Controls**
- Clear session cache button with confirmation toast.
- Reset all settings button.

**Step 5: Retain System Diagnostics Card**
- Keep the server status, binary detection, and security cards.

---

#### Task 4: Connect Conversion Settings to Default Preferences
**Files:**
- Modify: `frontend/src/pages/HomePage.tsx`
- Modify: `frontend/src/components/ConversionSettings.tsx`

**Step 1:** Pre-populate options with saved user preferences (default quality, aspect ratio lock, auto-download).

---

#### Task 5: Testing & Verification
**Files:**
- Create: `scratch/verify_settings_options.mjs`

**Step 1:** Verify font scaling changes visually in Edge headless across 100% and 110% scales.
**Step 2:** Verify theme toggle (light/dark/system).
**Step 3:** Run `npm run build` and `pytest`.
**Step 4:** Submit PR, merge to `dev`, sync to `main`.

