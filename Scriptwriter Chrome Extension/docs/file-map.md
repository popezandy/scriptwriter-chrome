# File Map (Version 1)

This document defines the expected file structure for version 1 of the Google Docs screenplay extension.

Its purpose is to answer three questions clearly:

1. how many files exist in v1
2. what each file is responsible for
3. how the files depend on each other

This is the implementation map for the MVP.

---

# Version 1 Goal

Version 1 is the smallest release that feels like a real screenplay editor inside Google Docs.

V1 must support:

- Google Docs page detection
- screenplay mode bootstrapping
- paragraph detection
- screenplay element inference
- Tab / Shift+Tab element cycling
- Enter next-element behavior
- screenplay formatting
- character autocomplete
- basic extension popup/settings
- stable enough caret restoration for normal writing

V1 does **not** require advanced analytics, revision colors, or export pipelines.

---

# Planned Repository Structure

```text
screenplay-docs-extension/
├── manifest.json
├── package.json
├── tsconfig.json
├── README.md
├── .gitignore
│
├── src/
│   ├── background/
│   │   ├── service-worker.ts
│   │   ├── commands.ts
│   │   └── messaging.ts
│   │
│   ├── content/
│   │   ├── index.ts
│   │   ├── docs-root.ts
│   │   ├── paragraph-mapper.ts
│   │   ├── selection-tracker.ts
│   │   ├── dom-observer.ts
│   │   ├── mutation-queue.ts
│   │   ├── key-handler.ts
│   │   └── formatter-bridge.ts
│   │
│   ├── engine/
│   │   ├── element-types.ts
│   │   ├── screenplay-model.ts
│   │   ├── parser.ts
│   │   ├── transition-rules.ts
│   │   ├── autocomplete.ts
│   │   └── normalization.ts
│   │
│   ├── formatting/
│   │   ├── element-styles.ts
│   │   └── formatter.ts
│   │
│   ├── ui/
│   │   ├── popup/
│   │   │   ├── popup.html
│   │   │   ├── popup.ts
│   │   │   └── popup.css
│   │   │
│   │   └── overlay/
│   │       ├── overlay-root.ts
│   │       ├── autocomplete-popup.ts
│   │       ├── element-indicator.ts
│   │       └── overlay.css
│   │
│   ├── storage/
│   │   ├── settings.ts
│   │   └── cache.ts
│   │
│   └── common/
│       ├── types.ts
│       ├── constants.ts
│       ├── runtime-messages.ts
│       ├── debounce.ts
│       └── logger.ts
│
├── docs/
│   ├── keyboard-spec.md
│   ├── dom-adapter.md
│   ├── file-map.md
│   └── parser-spec.md
│
└── tests/
    ├── parser.test.ts
    ├── transitions.test.ts
    └── autocomplete.test.ts
```

---

# Estimated File Count

## Project / config files
- `manifest.json`
- `package.json`
- `tsconfig.json`
- `README.md`
- `.gitignore`

Count: **5**

## Background files
- `src/background/service-worker.ts`
- `src/background/commands.ts`
- `src/background/messaging.ts`

Count: **3**

## Content files
- `src/content/index.ts`
- `src/content/docs-root.ts`
- `src/content/paragraph-mapper.ts`
- `src/content/selection-tracker.ts`
- `src/content/dom-observer.ts`
- `src/content/mutation-queue.ts`
- `src/content/key-handler.ts`
- `src/content/formatter-bridge.ts`

Count: **8**

## Engine files
- `src/engine/element-types.ts`
- `src/engine/screenplay-model.ts`
- `src/engine/parser.ts`
- `src/engine/transition-rules.ts`
- `src/engine/autocomplete.ts`
- `src/engine/normalization.ts`

Count: **6**

## Formatting files
- `src/formatting/element-styles.ts`
- `src/formatting/formatter.ts`

Count: **2**

## UI files
- `src/ui/popup/popup.html`
- `src/ui/popup/popup.ts`
- `src/ui/popup/popup.css`
- `src/ui/overlay/overlay-root.ts`
- `src/ui/overlay/autocomplete-popup.ts`
- `src/ui/overlay/element-indicator.ts`
- `src/ui/overlay/overlay.css`

Count: **7**

## Storage files
- `src/storage/settings.ts`
- `src/storage/cache.ts`

Count: **2**

## Common files
- `src/common/types.ts`
- `src/common/constants.ts`
- `src/common/runtime-messages.ts`
- `src/common/debounce.ts`
- `src/common/logger.ts`

Count: **5**

## Documentation files
- `docs/keyboard-spec.md`
- `docs/dom-adapter.md`
- `docs/file-map.md`
- `docs/parser-spec.md`

Count: **4**

## Test files
- `tests/parser.test.ts`
- `tests/transitions.test.ts`
- `tests/autocomplete.test.ts`

Count: **3**

---

# Total Estimated V1 File Count

**45 files**

This is a healthy size for a modular MVP.

Important note:

This does **not** mean all 45 files need to be fully complex on day one.
Some can begin as very small, focused modules.
The point is to keep responsibilities separated early, instead of collapsing everything into a few giant files.

---

# File Responsibilities

## Root files

### `manifest.json`
Defines the Chrome extension:
- permissions
- host permissions
- content script registration
- service worker entry
- popup configuration

### `package.json`
Defines scripts and dependencies for local development and builds.

### `tsconfig.json`
TypeScript compiler configuration.

### `README.md`
Primary GitHub landing page and project overview.

### `.gitignore`
Standard repo hygiene.

---

# Background Layer

## `src/background/service-worker.ts`
Main extension background entry point.

Responsibilities:
- extension install/setup
- boot defaults
- message routing
- command dispatch

## `src/background/commands.ts`
Registers and handles extension-level commands.

Responsibilities:
- toolbar or command shortcuts
- global toggles such as screenplay mode enable/disable

## `src/background/messaging.ts`
Centralizes messaging contracts for background communication.

Responsibilities:
- message handlers
- tab lookup helpers
- sending commands to content scripts

---

# Content Layer

## `src/content/index.ts`
Main entry point for code that runs inside Google Docs.

Responsibilities:
- boot sequence
- initialize DOM adapter
- initialize key handling
- initialize overlays

## `src/content/docs-root.ts`
Finds and validates the Google Docs editor root.

Responsibilities:
- editor root detection
- readiness checks
- retry logic

## `src/content/paragraph-mapper.ts`
Maps live DOM nodes into normalized paragraph records.

Responsibilities:
- paragraph discovery
- paragraph identity generation
- visible paragraph scanning
- text extraction

## `src/content/selection-tracker.ts`
Tracks caret and selection state.

Responsibilities:
- active paragraph resolution
- offset tracking
- restore-caret helpers

## `src/content/dom-observer.ts`
Attaches mutation observers to the Docs editor root.

Responsibilities:
- collect raw mutation records
- notify refresh systems

## `src/content/mutation-queue.ts`
Buffers and batches mutation handling.

Responsibilities:
- debounce refresh passes
- coalesce repeated updates
- avoid excessive rescans

## `src/content/key-handler.ts`
Owns keyboard-driven screenplay behavior.

Responsibilities:
- intercept Tab / Shift+Tab / Enter
- apply transition rules
- trigger formatting + caret restoration
- manage autocomplete key handling

## `src/content/formatter-bridge.ts`
Connects content-side DOM paragraph records to the formatting engine.

Responsibilities:
- call formatting module using DOM adapter output
- avoid mixing formatting logic into key-handler

---

# Engine Layer

## `src/engine/element-types.ts`
Defines screenplay element enums and element constants.

Responsibilities:
- canonical type list
- helper predicates
- element ordering references

## `src/engine/screenplay-model.ts`
Defines the shadow screenplay model.

Responsibilities:
- paragraph model interfaces
- document model interfaces
- helpers for updating in-memory state

## `src/engine/parser.ts`
Infers screenplay elements from normalized paragraph data.

Responsibilities:
- scene heading detection
- character detection
- dialogue inference
- transition detection

## `src/engine/transition-rules.ts`
Defines keyboard transition logic.

Responsibilities:
- Enter rules
- Tab rules
- Shift+Tab rules
- empty-paragraph edge cases

## `src/engine/autocomplete.ts`
Builds and ranks autocomplete suggestions.

Responsibilities:
- character dictionary generation
- prefix matching
- ranking
- suggestion acceptance rules

## `src/engine/normalization.ts`
Shared normalization helpers for screenplay text.

Responsibilities:
- uppercase normalization
- character-name cleanup
- whitespace rules
- text comparison helpers

---

# Formatting Layer

## `src/formatting/element-styles.ts`
Defines declarative formatting rules for each screenplay element.

Responsibilities:
- indentation config
- alignment config
- spacing config
- capitalization behavior

## `src/formatting/formatter.ts`
Applies formatting rules to live paragraphs.

Responsibilities:
- receive paragraph + element type
- apply proper style changes
- preserve or restore expected text state
- avoid destructive rewrites

---

# UI Layer

## `src/ui/popup/popup.html`
Extension popup markup.

## `src/ui/popup/popup.ts`
Popup behavior.

Responsibilities:
- enable/disable screenplay mode
- show current status
- show doc support state

## `src/ui/popup/popup.css`
Popup styling.

## `src/ui/overlay/overlay-root.ts`
Mount point for all in-document overlay UI.

Responsibilities:
- create top-level overlay container
- manage cleanup / rerender

## `src/ui/overlay/autocomplete-popup.ts`
Character suggestion dropdown.

Responsibilities:
- render suggestions
- highlight active option
- accept click selection
- position near caret or paragraph

## `src/ui/overlay/element-indicator.ts`
Shows current screenplay element near the caret or screen edge.

Responsibilities:
- display current paragraph type
- update on selection change

## `src/ui/overlay/overlay.css`
Styles for overlay UI elements.

---

# Storage Layer

## `src/storage/settings.ts`
Persistent user preferences.

Responsibilities:
- screenplay mode defaults
- feature toggles
- UI preferences

## `src/storage/cache.ts`
Extension-local caches.

Responsibilities:
- autocomplete ranking cache
- per-doc cached metadata
- temporary rebuild aids

Important:
The screenplay text itself does **not** live here.

---

# Common Layer

## `src/common/types.ts`
Shared TypeScript interfaces and types.

## `src/common/constants.ts`
Shared constants such as:
- host match patterns
- debounce intervals
- element names

## `src/common/runtime-messages.ts`
Central runtime message type definitions.

## `src/common/debounce.ts`
Small utility for debounced work queues.

## `src/common/logger.ts`
Development-safe logging utility.

---

# Docs Layer

## `docs/keyboard-spec.md`
Defines keyboard interactions.

## `docs/dom-adapter.md`
Defines DOM mapping and caret logic.

## `docs/file-map.md`
Defines repo structure and module responsibilities.

## `docs/parser-spec.md`
Will define how normalized paragraphs become screenplay elements.

---

# Test Layer

## `tests/parser.test.ts`
Parser behavior tests.

## `tests/transitions.test.ts`
Transition rule tests.

## `tests/autocomplete.test.ts`
Autocomplete ranking and suggestion tests.

---

# Dependency Direction

The intended dependency direction is:

```text
background -> common / storage
content -> common / engine / formatting / ui / storage
engine -> common
formatting -> common / engine
ui -> common / engine
storage -> common
tests -> engine / formatting / common
```

Important rule:

**Engine files must not depend on raw DOM.**

That separation is what keeps the core logic testable.

---

# MVP-Critical Files

If we prioritize files by implementation importance, the first critical group is:

1. `manifest.json`
2. `src/content/index.ts`
3. `src/content/docs-root.ts`
4. `src/content/paragraph-mapper.ts`
5. `src/content/selection-tracker.ts`
6. `src/content/key-handler.ts`
7. `src/engine/parser.ts`
8. `src/engine/transition-rules.ts`
9. `src/formatting/formatter.ts`
10. `src/ui/overlay/autocomplete-popup.ts`

If these are working, the extension becomes usable.