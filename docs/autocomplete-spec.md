
# Autocomplete Specification

This document defines how autocomplete behaves in the screenplay editor.

Autocomplete provides suggestions while typing certain screenplay elements,
primarily **Character names** in version 1.

Later versions may support:

- scene heading suggestions
- location suggestions
- time-of-day suggestions
- transition suggestions

---

# Goals

Autocomplete should:

- reduce repetitive typing
- maintain consistent character naming
- stay fast and unobtrusive
- never overwrite user text without confirmation

---

# Version 1 Scope

Autocomplete will support:

1. Character name suggestions
2. Suggestion ranking
3. Keyboard navigation
4. Suggestion acceptance

---

# Character Dictionary Generation

The dictionary of character names is generated automatically by scanning the document.

## Source

All paragraphs classified as **Character** elements by the parser.

Example:

JOHN
MARY
DETECTIVE RAMIREZ
MOM (O.S.)

---

# Dictionary Normalization

Names must be normalized before storage.

Normalization rules:

- trim whitespace
- preserve capitalization
- remove duplicate spacing
- treat identical names as one entry

Examples:

"JOHN"
" JOHN "
"JOHN  "

→ all normalize to

JOHN

---

# Ranking Rules

Suggestions should be ranked using:

1. prefix match strength
2. frequency in document
3. recency of use

Example typing:

MA

Possible results:

MARY
MARCUS
MARTIN

The most frequently used name should appear first.

---

# Suggestion Popup

The autocomplete popup appears when:

- user types in a Character paragraph
- current text length ≥ 1 character
- dictionary contains matching entries

Popup location:

- near caret position
- fallback to paragraph bounding box if caret location fails

---

# Keyboard Navigation

When popup is open:

Arrow Up → move selection up  
Arrow Down → move selection down  
Enter → accept suggestion  
Tab → accept suggestion  
Escape → close popup  

---

# Accepting Suggestions

Accepting a suggestion replaces the current typed prefix with the chosen name.

Example:

User typed:

MA

User selects:

MARY

Final paragraph becomes:

MARY

Caret moves to end of line.

---

# Future Autocomplete Features

Future versions may add:

## Scene heading suggestions

Example typing:

INT.

Suggestions:

INT. HOUSE - DAY  
INT. OFFICE - NIGHT

## Location suggestions

Locations gathered from existing scene headings.

## Time of day suggestions

Examples:

DAY  
NIGHT  
MORNING  
EVENING

---

# Performance Requirements

Autocomplete must:

- generate suggestions in under 50ms
- never block typing
- avoid scanning the entire document on every keystroke

Recommended strategy:

- maintain cached dictionary
- update dictionary incrementally when new character cues appear
