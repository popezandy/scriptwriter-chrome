# Screenplay Mode for Google Docs

A Chrome extension that turns **Google Docs into a keyboard-driven screenplay editor**, similar to Final Draft, while keeping the script stored as a **normal Google Doc**.

The extension adds:

- screenplay element awareness
- keyboard-driven editing workflow
- character autocomplete
- screenplay formatting
- document analytics (future)
- scene navigation (future)

The Google Doc remains the **canonical source of the screenplay**, enabling:

- automatic Drive syncing
- cross-device editing
- version history
- collaboration

No exporting or format conversion required.

---

# Why this exists

Screenwriting software typically forces users into proprietary formats or expensive subscriptions.

This project separates responsibilities:

**Google Docs provides:**

- syncing
- storage
- collaboration
- version history

**This extension provides:**

- screenplay editing behavior
- keyboard shortcuts
- formatting
- autocomplete
- analytics

The result is a **cloud-synced screenplay editor** that works anywhere Google Docs works.

---

# Core Concept

The extension treats a script as a sequence of **semantic elements**, not styled paragraphs.

Supported elements:

Scene Heading  
Action  
Character  
Dialogue  
Parenthetical  
Transition  
Shot

Each paragraph in the document is assigned an element type.

Formatting and editing behavior follow from that type.

---

# Example Script

INT. HOUSE - NIGHT

John enters the room.

JOHN  
Hello?

MARY  
You're late.

CUT TO:

Internally the extension models this as:

scene → action → character → dialogue → character → dialogue → transition

---

# Keyboard Workflow

The extension replicates the **screenwriting keyboard workflow** used by Final Draft and Trelby.

Tab  
Cycle element type.

Example:

Action → Character → Dialogue → Parenthetical → Dialogue → Action

Shift + Tab  
Reverse cycle.

Enter  
Insert next logical element.

Scene → Action  
Action → Action  
Character → Dialogue  
Parenthetical → Dialogue  
Dialogue → Action

Enter + Tab  
Shortcut to create Character block.

---

# Character Autocomplete

When typing inside a **Character block**, the extension suggests previously used character names.

Example:

User types:

MA

Suggestions:

MARY  
MARCUS  
MARTIN

Selecting one inserts it into the document.

The character dictionary is automatically built from the document.

---

# Project Architecture

The extension is composed of five major systems.

Chrome Extension
│
├── Background service worker
├── Content script (runs in Google Docs)
├── Screenplay engine
├── UI overlay components
└── Storage / settings

---

# Google Docs Integration

The extension runs directly inside the Docs editor.

It performs:

- keyboard interception
- paragraph detection
- formatting changes
- autocomplete UI
- DOM observation

The document itself remains a normal Google Doc.

---

# Repository Structure

screenplay-docs-extension

├── manifest.json  
├── src  
│   ├── background  
│   ├── content  
│   ├── engine  
│   ├── formatting  
│   ├── ui  
│   ├── storage  
│   └── common  
└── docs

---

# Estimated File Count (v1)

Approximate structure for MVP:

Background: 3 files  
Content scripts: 6 files  
Engine: 5 files  
Formatting: 2 files  
UI overlay: 3 files  
Popup UI: 2 files  
Storage: 2 files  
Common utilities: 3 files  
Documentation: 3 files  

Total:

~29 files

---

# Version 1 Roadmap

Milestone 1  
Detect Google Docs editor and track active paragraph.

Milestone 2  
Identify screenplay element types.

Milestone 3  
Keyboard engine (Tab / Shift+Tab / Enter).

Milestone 4  
Formatting engine.

Milestone 5  
Character autocomplete.

---

# Version 2 Roadmap

Scene navigator  
Dialogue analytics  
Revision colors  
Fountain export  
FDX export

---

# Development Status

Current phase: **Architecture design**

Next step: **build Chrome extension scaffold**
