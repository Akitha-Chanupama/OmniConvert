# OmniConvert — Sidebar Panel UI Redesign Implementation Plan

> **Source of Truth:** User proposed UI designs for Light Mode and Dark Mode.
> **Branch Strategy:** Work will proceed on the `dev` branch; upon completion, changes will be pushed, PR opened, and merged into `main`.

---

## 1. Visual Design Comparison

````carousel
![Light Mode UI Mockup](file:///C:/Users/nipuni.rajapaksha/.gemini/antigravity/brain/d57b045d-75ad-4d85-b20f-88ffede4c694/ui-light-mockup.jpg)
<!-- slide -->
![Dark Mode UI Mockup](file:///C:/Users/nipuni.rajapaksha/.gemini/antigravity/brain/d57b045d-75ad-4d85-b20f-88ffede4c694/ui-dark-mockup.jpg)
````

### Key Visual & Architectural Highlights
1. **Persistent Dark Navigation Sidebar**:
   - Both Light and Dark modes feature a consistent, high-contrast dark navy sidebar (`#0c1326`).
   - Grouped tool shortcuts categorized under: `IMAGE CONVERSION`, `PDF TOOLS`, `DOCUMENT CONVERTER`, `SPREADSHEET CONVERTER`, and `DATA CONVERTER`.
   - Bottom shortcut to `Diagnostics & Settings`.
2. **Top Navigation Header**:
   - Global interactive tool search input (`Search for a tool...`) with instant format filtering.
   - Light / Dark mode toggle switch.
   - Live engine status pill (`● Local Engine (127.0.0.1:8000)`) with security shield indicator.
3. **Hero & Value Proposition Section**:
   - "FILE CONVERSION MADE SIMPLE" badge overline.
   - Core title: "Convert files. Keep it simple." and descriptive subtitle.
   - 3 top-right value badges:
     - 🛡️ **100% Local**: *Your files stay on your device*
     - ⚡ **Fast & Reliable**: *Powered by local engine*
     - 🔒 **Secure**: *No internet required*
4. **Main Workspace (2-Column Studio)**:
   - **Left Column (~60%)**:
     - *Select or Drop Files Card*: Circular cloud upload icon, drag & drop, clipboard paste (`Ctrl + V`), and format chip pills.
     - *File Queue*: Per-file card showing thumbnail, dimensions/size, target format pill dropdown (`JPG → PNG ▾`), preview eye button, reorder arrows, and delete action.
     - *Popular Quick Actions Card*: One-click conversion shortcuts (`Image → PDF`, `PDF → JPG`, `Excel → CSV`, `JPG → PNG`, `JSON → CSV`) with link to view all tools.
   - **Right Column (~40%)**:
     - *Conversion Settings Panel*: Sticky control center.
     - 8-grid output format selector (`PNG`, `JPG`, `WEBP`, `PDF`, `DOCX`, `XLSX`, `CSV`, `JSON`) with vibrant active state.
     - Image compression slider with percentage badge and scale markers (20%, 60%, 100%).
     - Resize dimensions inputs (Width $\times$ Height in px) with "Lock Aspect Ratio" checkbox.
     - Full-width conversion button (`Convert 1 File Now →`) styled in deep navy for light mode and vibrant royal blue for dark mode.

---

## 2. Target Component Architecture

```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx               # [NEW] Navigation sidebar with tool groups & active routing
│   │   ├── TopHeader.tsx             # [NEW] Top bar with tool search, engine indicator, and theme toggle
│   │   └── AppLayout.tsx             # [NEW] Root layout wrapper combining Sidebar + Header + Content
│   ├── dashboard/
│   │   ├── HeroBanner.tsx            # [NEW] Header headline + 3 value prop badges
│   │   ├── QuickActions.tsx          # [NEW] 5 horizontal one-click preset action cards
│   │   └── SearchPalette.tsx         # [NEW] Search dropdown for rapid tool navigation
│   ├── FileDropzone.tsx              # [UPDATE] Circular cloud icon, drag/drop + Ctrl+V
│   ├── FileCard.tsx                  # [UPDATE] Thumbnail, target dropdown pill, action controls
│   ├── ConversionSettings.tsx        # [UPDATE] 8-grid format buttons, compression slider, dimensions
│   ├── ConversionResult.tsx          # [PRESERVE] Conversion summary, ZIP download, and preview
│   └── PreviewModal.tsx              # [PRESERVE] Image, code, HTML rendered vs source, and PDF preview
├── pages/
│   ├── HomePage.tsx                  # [UPDATE] Compose new HeroBanner, Workspace Grid, QuickActions
│   ├── ToolsPage.tsx                 # [PRESERVE & ALIGN] Directory view accessible via sidebar
│   └── SettingsPage.tsx              # [PRESERVE & ALIGN] Diagnostics view accessible via sidebar bottom
├── types/                            # [EXTEND] Navigation & tool preset types
└── utils/
```

---

## 3. Phased Implementation Plan

### Phase 1: Layout Shell & Sidebar System
- **Task 1.1**: Create `Sidebar.tsx` with high-contrast navy background (`#0c1326`), brand badge, and category sections:
  - `IMAGE CONVERSION`: JPG to PNG, PNG to JPG, WEBP to JPG, HEIC to JPG
  - `PDF TOOLS`: PDF to JPG, JPG to PDF, Merge PDF, Split PDF
  - `DOCUMENT CONVERTER`: DOCX to PDF, PDF to DOCX, TXT to PDF
  - `SPREADSHEET CONVERTER`: XLSX to CSV, CSV to XLSX
  - `DATA CONVERTER`: JSON to CSV, CSV to JSON
  - `Diagnostics & Settings` footer action
- **Task 1.2**: Support responsive collapse (hamburger drawer on mobile/tablet, persistent desktop sidebar).
- **Task 1.3**: Wire sidebar clicks to automatically activate tool presets (setting source & target formats) on the main workspace.

### Phase 2: Top Header & Global Search
- **Task 2.1**: Build `TopHeader.tsx` featuring:
  - Rounded search input with search icon.
  - Dropdown filter for quick jumping to any supported conversion.
  - Sun / Moon theme toggle with smooth transition.
  - Live local engine status indicator (`● Local Engine (127.0.0.1:8000)`) with security shield.

### Phase 3: Hero Banner & Value Proposition Cards
- **Task 3.1**: Build `HeroBanner.tsx`:
  - `FILE CONVERSION MADE SIMPLE` eyebrow text.
  - `Convert files. Keep it simple.` primary heading.
  - Subtitle describing multi-format capability.
  - 3 pill badges with icons:
    - `100% Local` (*Your files stay on your device*)
    - `Fast & Reliable` (*Powered by local engine*)
    - `Secure` (*No internet required*)

### Phase 4: Modernized Upload Stage & File Queue
- **Task 4.1**: Upgrade `FileDropzone.tsx`:
  - Blue circular upload cloud icon with centered layout.
  - Subtext: "Supports multiple files. Press Ctrl + V to paste from clipboard."
  - Supported format pills: `JPG`, `PNG`, `WEBP`, `PDF`, `DOCX`, `XLSX`, `CSV`, `JSON`.
- **Task 4.2**: Refactor queue list in `HomePage.tsx` / `FileCard.tsx`:
  - Thumbnail preview on left with file size.
  - Inline target format dropdown pill (`JPG → PNG ▾`).
  - Eye preview button, reorder arrows (`↑↓`), and trash button.
  - Counter badge: `N files selected` with batch clear button.

### Phase 5: Popular Quick Actions Hub
- **Task 5.1**: Implement `QuickActions.tsx` card below the dropzone:
  - Amber lightning icon with "Popular Quick Actions".
  - Horizontal buttons:
    - 🖼️ `Image → PDF`
    - 📄 `PDF → JPG`
    - 📊 `Excel → CSV`
    - 🖼️ `JPG → PNG`
    - 🗄️ `JSON → CSV`
  - "View all tools →" shortcut link leading to `ToolsPage`.

### Phase 6: Conversion Settings & Action Studio
- **Task 6.1**: Update `ConversionSettings.tsx`:
  - 8-grid format buttons: `PNG`, `JPG`, `WEBP`, `PDF`, `DOCX`, `XLSX`, `CSV`, `JSON`.
  - Blue active fill for selected format.
  - Slider for Image Compression with percentage readout (`80%`) and marker scale.
  - Dimension inputs (`Width (px)` $\times$ `Height (px)`) with "Lock Aspect Ratio" checkbox.
  - Large full-width conversion CTA (`⇄ Convert N File(s) Now →`).

### Phase 7: Dual-Mode Styling & Polish
- **Task 7.1**: Fine-tune Light Mode:
  - Sidebar: `#0c1326` (dark navy).
  - Main background: `#f4f6fa` (clean soft gray).
  - Cards: Pure white `#ffffff` with light slate borders `#e2e8f0`.
  - CTA button: Deep navy `#0c1326`.
- **Task 7.2**: Fine-tune Dark Mode:
  - Main background: `#070b16`.
  - Cards: `#0d1527` with subtle dark borders `#1e293b`.
  - CTA button: Vibrant royal blue `#2563eb`.

### Phase 8: Verification, Test Suite & Git PR Workflow
- **Task 8.1**: Run `npm run build` in `frontend/` to ensure zero TypeScript errors with `verbatimModuleSyntax: true`.
- **Task 8.2**: Run `pytest` in `backend/` to verify all 22 tests pass.
- **Task 8.3**: Commit changes on `dev`, push to `origin/dev`.
- **Task 8.4**: Open PR targeting `main` using `gh pr create` and merge into `main` using `gh pr merge --merge`.

---

## 4. Execution Readiness

| Criteria | Status |
| :--- | :--- |
| **Design Specifications** | Fully extracted from user mockups (both Light & Dark modes) |
| **Branch State** | Switched to `dev` branch with tracking to `origin/dev` |
| **GitHub CLI (`gh`)** | Installed, authenticated, and verified for PR creation and merging |
| **Backend API** | Live on `127.0.0.1:8000`, 22/22 tests passing |
| **Frontend Dev Server** | Live on `localhost:5173` |

> [!NOTE]
> Please review this plan. Upon your confirmation, we will begin execution task-by-task on the `dev` branch and merge into `main` via PR when complete.
