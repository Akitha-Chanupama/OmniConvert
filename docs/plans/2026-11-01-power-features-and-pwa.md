# Implementation Plan: Power Features, History, PWA & UX Delighters

This plan covers the implementation of the 5 requested enhancement features:
1. Instant "Paste Raw Text / Code" Tool
2. Conversion History Drawer
3. Install as Desktop App (PWA & Service Worker)
4. Completion Sound Cue (Web Audio API Synthesizer)
5. Estimated Compressed File Size

---

## Architecture & Component Breakdown

### 1. Instant "Paste Raw Text / Code" Tool (`frontend/src/components/PasteSnippetModal.tsx`)
- Modal with syntax/mode tabs: **Markdown**, **JSON**, **Plain Text / Code**, **CSV**.
- Input features:
  - Textarea with character / word count and auto-formatting ("Prettify JSON" / "Clear").
  - Target format auto-selection:
    - Markdown -> `PDF`
    - JSON -> `CSV`
    - CSV -> `JSON`
    - Plain Text -> `PDF` or `DOCX`
  - Filename configuration (defaulting to `snippet.md`, `data.json`, `records.csv`, etc.).
- Integration:
  - On submit: constructs `new File([rawText], filename, { type: mimeType })`.
  - Dispatches directly to `onFilesDropped([file])` in `App.tsx` and selects the corresponding conversion preset.
  - Accessible via `TopHeader` button ("Paste Snippet"), `HomePage` quick action pill, and Command Palette (`Ctrl+K`).

### 2. Conversion History Drawer (`frontend/src/components/ConversionHistoryDrawer.tsx` + `frontend/src/utils/historyStore.ts`)
- Sliding right drawer with backdrop.
- Stored records in `localStorage`:
  - `id`: unique UUID/timestamp
  - `timestamp`: epoch time
  - `originalFilename`: string
  - `convertedFilename`: string
  - `sourceFormat`: string
  - `targetFormat`: string
  - `originalSize`: number
  - `convertedSize`: number
  - `downloadUrl`: blob URL or download link (if still valid within session)
  - `textPreview`: snippet of converted text (for MD/JSON/TXT)
- Actions:
  - Re-download / preview converted file.
  - "Clear History" button with confirmation modal/tooltip.
  - Export history log as JSON.
- Triggered by clock/history icon in `TopHeader` (with item count badge) and Command Palette.

### 3. Install as Desktop App (PWA & Service Worker)
- Enhanced `frontend/public/site.webmanifest`:
  - Added `start_url: "/"`, `scope: "/"`, `id: "omniconvert-app"`, `categories: ["utilities", "productivity"]`.
- Service worker `frontend/public/sw.js`:
  - Lightweight offline shell caching for core assets.
- Install prompt hook & button:
  - Capture `beforeinstallprompt` event.
  - Provide an "Install App" button in `TopHeader` and `SettingsPage` when the browser supports installation.
  - Fallback guidance for macOS/iOS Safari ("Add to Home Screen").

### 4. Completion Sound Cue (`frontend/src/utils/soundEffects.ts`)
- Web Audio API dual-tone major-triad chime (zero external audio file dependencies):
  - Chord frequencies: 659 Hz (E5) -> 830 Hz (G#5) -> 987 Hz (B5) with smooth exponential gain decay.
- Configurable in `settingsStore.ts`:
  - `soundEffects: boolean` (default `true`).
  - Added toggle & "Test Audio Chime" button to `SettingsPage.tsx`.
  - Triggered in `HomePage.tsx` upon successful conversion completion.

### 5. Estimated Compressed File Size
- In `frontend/src/components/SettingsPanel.tsx`:
  - Reads active files in queue (total raw size).
  - Calculates estimated output size based on:
    - Target format compression curve (`JPG`, `WEBP`, `PNG`).
    - Quality slider (1-100%).
    - Resize scale percentage (e.g. 50% scale = 25% pixel area).
  - Renders an informative, responsive badge:
    - E.g. `Estimated Output: ~540 KB (75% savings)` in emerald styling.

---

## Execution Order
1. Implement `soundEffects.ts` and integrate with `settingsStore.ts` & `SettingsPage.tsx`.
2. Implement estimated size calculations in `SettingsPanel.tsx`.
3. Implement `historyStore.ts` and `ConversionHistoryDrawer.tsx`.
4. Implement `PasteSnippetModal.tsx` and integrate with `TopHeader.tsx` & `App.tsx`.
5. Implement PWA service worker, webmanifest enhancements, and install prompt handler.
6. Verify via `npm run build` & browser testing.
7. Commit, push, create PR targeting `dev`, merge, and sync `main`.
