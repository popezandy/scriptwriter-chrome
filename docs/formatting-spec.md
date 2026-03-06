
# Formatting Specification

This document defines how screenplay formatting is applied in Google Docs.

Formatting rules are determined by the screenplay element type.

---

# Font

Default screenplay font:

Courier or Courier-like monospace.

Recommended:

Courier Prime

---

# Page Width Model

Screenplays traditionally use a fixed character grid.

Typical assumptions:

- 12pt Courier
- 10 characters per inch

Google Docs does not strictly enforce this grid, but indentation should approximate it.

---

# Element Formatting

## Scene Heading

Properties:

- uppercase
- left aligned
- no indentation

Example:

INT. HOUSE - NIGHT

---

## Action

Properties:

- left aligned
- normal case
- full width paragraph

Example:

John enters the room.

---

## Character

Properties:

- uppercase
- indented toward center
- shorter line width

Example:

JOHN

---

## Dialogue

Properties:

- centered column
- narrower margins

Example:

I don't think that's a good idea.

---

## Parenthetical

Properties:

- indented slightly further than character
- surrounded by parentheses

Example:

(whispering)

---

## Transition

Properties:

- right aligned
- uppercase

Example:

CUT TO:

---

# Formatting Application Rules

Formatting should only modify:

- indentation
- alignment
- spacing
- capitalization when appropriate

The formatter must **never destroy user text**.

---

# Safe Formatting Strategy

Steps:

1. read paragraph text
2. determine element type
3. compute expected formatting
4. apply minimal formatting changes
5. restore caret position

---

# Formatting Failure Handling

If formatting cannot be safely applied:

- skip formatting
- leave text untouched
- log debug message in development mode
