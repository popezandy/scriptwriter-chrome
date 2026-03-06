# DOM Adapter Specification

This document defines how the extension will interact with the Google Docs editor DOM.

The DOM adapter is the most fragile and important subsystem in the project.
Its purpose is to translate between:

- the live Google Docs page
- the extension's screenplay model
- the user's caret and selection state

The adapter must be resilient to DOM rerenders, collaborator edits, formatting changes, and delayed page initialization.

---

# Purpose

The DOM adapter is responsible for:

- finding the Google Docs editor surface
- detecting visible paragraph-like units
- mapping those units into screenplay paragraphs
- tracking the active paragraph and caret
- observing mutations and refreshing stale mappings
- exposing a stable API to the screenplay engine

The screenplay engine should **not** depend directly on raw Google Docs DOM nodes.

Instead, the DOM adapter acts as a translation layer.

---

# Design Principle

Google Docs is not a normal textarea.

The extension must assume:

- nodes may be replaced without warning
- paragraph containers may rerender
- the caret can move without a key event
- formatting changes may alter DOM structure
- collaborator edits may invalidate local references

Because of this, the adapter must maintain a **stable internal paragraph mapping**.

The DOM is treated as an unstable rendering layer.

---

# Responsibilities

The DOM adapter owns the following concerns:

1. editor root detection
2. paragraph discovery
3. paragraph identity
4. text extraction
5. caret tracking
6. selection tracking
7. mutation observation
8. re-mapping after change
9. exposing paragraph APIs to the engine

The DOM adapter does **not** decide screenplay semantics.
It only provides paragraph-level access.

---

# High-Level Flow

The extension lifecycle should follow this sequence:

1. detect that the user is on a supported Google Docs document page
2. locate the editor root
3. wait until the editing surface is ready
4. scan visible paragraph nodes
5. build paragraph mappings
6. determine current caret location
7. hand normalized paragraph data to the screenplay engine
8. watch for mutations and refresh incrementally

---

# File Ownership

The DOM adapter logic is expected to live primarily in these files:

```text
src/content/docs-root.ts
src/content/paragraph-mapper.ts
src/content/selection-tracker.ts
src/content/dom-observer.ts
src/content/mutation-queue.ts
```

Supporting utilities may exist in:

```text
src/common/types.ts
src/common/utils.ts
```

---

# Editor Root Detection

## Goal

Find the active Google Docs editing surface reliably.

## Constraints

Google Docs does not expose a stable public API for extension-level screenplay editing.
The visible page may load before the editor surface is fully ready.
Some UI elements in Docs are not part of the editable document body.

## Requirements

The extension must:

- detect whether the current tab is a Google Docs document page
- locate the editable document surface
- avoid attaching listeners to toolbar or sidebar UI
- retry root detection if the editor is not ready yet

## Strategy

The adapter should:

1. wait for document ready state
2. search for likely editor root containers
3. verify the candidate root contains editable content
4. verify selection/caret events can be resolved inside that root
5. only then mount observers and key handlers

## Failure Handling

If the editor root cannot be found:

- the extension should remain idle
- log a warning in development mode
- retry periodically with backoff
- avoid throwing unhandled errors

---

# Paragraph Discovery

## Goal

Find paragraph-like blocks that correspond to screenplay units.

## Requirements

The adapter must be able to:

- enumerate visible paragraph blocks
- map a DOM node to a paragraph record
- retrieve text content for that paragraph
- re-find a paragraph after rerender if possible

## Important Note

A Google Docs "paragraph" in the DOM may not correspond perfectly to a semantic paragraph in the screenplay model.

The adapter should therefore define its own normalized paragraph type.

Example internal structure:

```ts
type ParagraphRecord = {
  id: string;
  text: string;
  node: HTMLElement | null;
  indexHint: number;
  formattingFingerprint: string;
  isVisible: boolean;
};
```

---

# Paragraph Identity

## Goal

Assign a stable identity to paragraph records even when Google Docs rerenders nodes.

## Requirements

The ID must survive ordinary typing when possible.

## Strategy

Paragraph identity should be derived from a combination of:

- nearby text content
- relative document position
- local neighborhood context
- a temporary node association while valid

Recommended identity inputs:

```text
previous paragraph text prefix
current paragraph text prefix
next paragraph text prefix
visible index hint
```

This produces a "soft stable" identity rather than a permanent ID.

## Why this matters

If the extension keys everything off raw node references, autocomplete, element type tracking, and caret restoration will break as soon as Docs rebuilds the DOM.

---

# Text Extraction

## Goal

Extract the paragraph's plain text reliably.

## Requirements

The adapter must:

- collect visible text from the paragraph node
- normalize whitespace
- preserve user-facing text content
- avoid injecting screenplay metadata into visible text

## Rules

Text extraction should:

- collapse nonsemantic whitespace
- trim zero-width artifacts when encountered
- preserve punctuation and capitalization
- preserve line content exactly enough for screenplay parsing

The output should be plain text only.

---

# Caret Tracking

## Goal

Track the user's caret in a way that can be translated back to a paragraph and offset.

## Requirements

The adapter must be able to answer:

- which paragraph is active
- what text offset the caret is at
- whether the user has a collapsed caret or range selection

## Strategy

Use a combination of:

- Selection API
- active element checks
- DOM ancestry lookup
- cached paragraph mapping

Example internal structure:

```ts
type CaretPosition = {
  paragraphId: string | null;
  offset: number;
  isCollapsed: boolean;
};
```

## Special Cases

The adapter must handle:

- caret at start of paragraph
- caret at end of paragraph
- selection spanning multiple paragraphs
- composition / IME input states
- cases where Docs temporarily reports ambiguous selection data

---

# Selection Tracking

## Goal

Keep selection state synchronized with the internal model.

## Requirements

Selection tracking must:

- update when the user clicks
- update when the user navigates with arrow keys
- update after formatting operations
- update after inserted paragraphs
- recover after DOM rerenders

## Rules

If the selection spans multiple paragraphs:

- element transitions should be disabled unless explicitly supported
- formatting actions should either operate on the whole range or be blocked in MVP
- autocomplete should not appear

For MVP, multi-paragraph selection should be treated as **read-only for screenplay shortcuts**.

---

# Mutation Observation

## Goal

Detect when the Docs DOM changes in ways that invalidate paragraph mappings or selection assumptions.

## Implementation

The adapter should use a `MutationObserver` attached to the editor root.

The observer should watch for:

- child node additions
- child node removals
- text subtree changes
- formatting-related DOM replacements

## Important Rule

Mutation processing must be debounced or queued.

Do not rescan the whole document for every single mutation event.

Use a mutation queue and batch processing strategy.

---

# Mutation Queue

## Goal

Prevent excessive remapping work during rapid edits.

## Requirements

The queue must:

- buffer incoming mutation records
- schedule a single refresh pass
- merge redundant refresh work
- prioritize active paragraph stability

## Refresh Strategy

The first implementation should:

1. collect all mutations during a short window
2. determine affected paragraph regions
3. rescan only the affected visible region
4. update paragraph records
5. repair active selection mapping if needed

If region detection is too brittle in MVP, fallback to rescanning all visible paragraphs is acceptable.

---

# Mapping API

The DOM adapter should expose a clean API to the rest of the extension.

Suggested interface:

```ts
interface DocsDomAdapter {
  isReady(): boolean;
  getEditorRoot(): HTMLElement | null;
  getVisibleParagraphs(): ParagraphRecord[];
  getParagraphById(id: string): ParagraphRecord | null;
  getActiveCaret(): CaretPosition | null;
  refreshMappings(): void;
  restoreCaret(position: CaretPosition): boolean;
}
```

The screenplay engine should only use this API, not raw DOM queries.

---

# Caret Restoration

## Goal

After formatting or inserting a paragraph, restore the caret to the expected location.

## Requirements

The adapter must support:

- placing caret at start of paragraph
- placing caret at end of paragraph
- placing caret at a specific offset when possible

## Constraints

Caret restoration may fail if Docs rerenders immediately after a formatting change.

## Strategy

Attempt restoration in phases:

1. immediate restore
2. microtask or short timeout retry
3. remap paragraph and retry once
4. fail gracefully if paragraph no longer exists

---

# Interaction with Screenplay Engine

The screenplay engine should receive normalized paragraph data, for example:

```ts
type EngineParagraph = {
  id: string;
  text: string;
  formattingFingerprint: string;
};
```

The engine then determines:

- screenplay element type
- next element transitions
- autocomplete candidates
- formatting rules

The DOM adapter should not guess screenplay meaning unless it is producing a lightweight formatting fingerprint.

---

# Formatting Fingerprint

## Goal

Provide a small structural summary of paragraph formatting that can help inference.

Possible fingerprint inputs:

- alignment
- indentation
- text-transform hints
- font family
- spacing patterns

Example:

```ts
type FormattingFingerprint = {
  align: "left" | "right" | "center" | "unknown";
  indentStart: number | null;
  indentEnd: number | null;
  isUppercaseLike: boolean;
};
```

This fingerprint helps distinguish:

- scene heading
- character
- dialogue
- transition

without hard-coding semantics inside the DOM layer.

---

# Overlay Positioning

The DOM adapter must help position UI overlays such as:

- autocomplete popup
- current element indicator
- inline status badges

## Requirements

The adapter must be able to determine:

- caret bounding box if possible
- paragraph bounding box fallback
- viewport-relative position
- scroll updates

If precise caret box lookup is unreliable, the popup may anchor to the active paragraph container in MVP.

---

# Error Tolerance

The DOM adapter must fail safely.

If mapping becomes ambiguous:

- do not corrupt the document
- do not apply random formatting
- disable the current shortcut action
- log diagnostics in development mode

MVP should prefer **missing a shortcut** over **damaging the user's text**.

---

# Non-Goals for MVP

The DOM adapter does not need to support all of the following in version 1:

- comments / suggestions mode awareness
- headers / footers
- tables
- footnotes
- multi-column layouts
- full offline reconciliation
- multi-range editing

These can be added later if needed.

---

# Testing Strategy

The DOM adapter should be tested at three levels:

## Unit tests

Test pure mapping helpers such as:

- paragraph identity generation
- whitespace normalization
- formatting fingerprint generation

## Integration tests

Test against captured or simulated Docs-like DOM fragments.

## Manual tests

Validate real behavior in live Google Docs for:

- typing
- backspacing
- pressing Enter
- Tab/Shift+Tab
- collaborator edits
- page reloads
- long documents
- scrolling

---

# Debugging Requirements

Development mode should include optional debug tools:

- highlight detected paragraph boundaries
- show current paragraph id
- show inferred caret paragraph
- log mutation batches
- log restore-caret attempts

These tools should be hidden or disabled in production builds.

---

# Success Criteria

The DOM adapter is considered successful for MVP if it can reliably:

- detect the active Google Docs editor
- identify the current paragraph
- extract paragraph text
- track caret position well enough for screenplay shortcuts
- survive routine DOM changes
- restore caret after element transitions
- support overlay positioning for autocomplete

If these conditions are met, the rest of the screenplay engine can be built on top of it safely.