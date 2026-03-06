# Parser Specification

This document defines how the extension converts normalized Google Docs paragraphs into screenplay element types.

The parser is the logic layer that sits between:

- the DOM adapter, which provides paragraph text and formatting fingerprints
- the screenplay engine, which needs stable semantic element types

Its job is to answer:

**What kind of screenplay paragraph is this?**

---

# Purpose

The parser determines whether a paragraph should be classified as:

- Scene Heading
- Action
- Character
- Dialogue
- Parenthetical
- Transition
- Shot

This classification powers:

- keyboard transition behavior
- formatting decisions
- autocomplete behavior
- analytics
- scene navigation

The parser is one of the most important logic layers in the project.

---

# Parser Inputs

The parser does **not** read raw Google Docs DOM directly.

It operates on normalized paragraph records produced by the DOM adapter.

Suggested input shape:

```ts
type EngineParagraph = {
  id: string;
  text: string;
  formattingFingerprint?: {
    align: "left" | "right" | "center" | "unknown";
    indentStart: number | null;
    indentEnd: number | null;
    isUppercaseLike: boolean;
  };
  previousType?: ScreenplayElement | null;
  nextText?: string | null;
  previousText?: string | null;
};
```

---

# Parser Outputs

The parser returns one canonical element type:

```ts
type ScreenplayElement =
  | "scene"
  | "action"
  | "character"
  | "dialogue"
  | "parenthetical"
  | "transition"
  | "shot";
```

Optionally, the parser may also return metadata:

```ts
type ParseResult = {
  type: ScreenplayElement;
  confidence: number;
  reasons: string[];
};
```

The `reasons` field is mainly for development/debugging.

---

# Core Rule

The parser should be **deterministic**.

Given the same normalized paragraph input, it should always return the same element type.

No random or AI-based behavior belongs in v1 parsing.

---

# Design Philosophy

The parser should combine:

1. text-pattern rules
2. formatting-fingerprint rules
3. local context rules

The ordering matters.

The parser must prefer **clear signals** over weak guesses.

When signals conflict, the parser should default to the safest type:

**Action**

Action is the fallback type because it is the least destructive interpretation.

---

# Parsing Priority

The parser should evaluate paragraphs in this rough order:

1. empty / whitespace handling
2. parenthetical detection
3. transition detection
4. scene heading detection
5. shot detection
6. character detection
7. dialogue inference
8. fallback to action

This order is intentional.

For example:
- parentheticals are easy to identify from text shape
- transitions often have strong right-alignment / `TO:` signals
- dialogue often depends on previous paragraph type and should be resolved later

---

# Empty Paragraphs

## Rule

If a paragraph is empty or whitespace-only, the parser should not try to infer a strong screenplay meaning from text alone.

## Behavior

For MVP, empty paragraphs should parse as:

- previous type if in an active transition flow, or
- action by default

Recommended simple v1 rule:

```text
empty paragraph -> action
```

The keyboard engine will often manage empty paragraphs explicitly anyway.

---

# Parenthetical Detection

## Strong signals

A paragraph is likely a parenthetical if:

- it begins with `(` and ends with `)`
- it is relatively short
- it appears after a Character or Dialogue paragraph
- it has parenthetical-like indentation

Examples:

```text
(whispering)
(beat)
(to John)
```

## Rule

If text matches a parenthetical shape, classify as `parenthetical` unless stronger evidence says otherwise.

## Constraints

Do not classify long multi-sentence text inside parentheses as a parenthetical automatically if it clearly looks like action.

---

# Transition Detection

## Strong signals

A paragraph is likely a transition if:

- it ends with `TO:`
- it matches common transition phrases
- it is right-aligned
- it is uppercase-like

Examples:

```text
CUT TO:
DISSOLVE TO:
SMASH CUT TO:
FADE OUT.
```

## Known transition phrases

The parser should recognize at least:

- CUT TO:
- DISSOLVE TO:
- SMASH CUT TO:
- MATCH CUT TO:
- FADE OUT.
- FADE TO BLACK.
- BACK TO:
- JUMP CUT TO:

## Rule

If text matches a known transition pattern, return `transition`.

If the paragraph is right-aligned and uppercase-like and ends with `:`, that should increase confidence heavily.

---

# Scene Heading Detection

## Strong signals

A paragraph is likely a scene heading if it begins with screenplay location markers such as:

- INT.
- EXT.
- INT/EXT.
- EST.

Examples:

```text
INT. APARTMENT - NIGHT
EXT. PARKING LOT - DAY
INT/EXT. CAR - MOVING - NIGHT
```

## Rule

If the paragraph begins with a recognized scene prefix, classify as `scene`.

## Notes

The parser should normalize common variants:

- `INT `
- `EXT `
- missing punctuation forms may be supported later

For v1, prefer stricter recognition:

```text
INT.
EXT.
INT/EXT.
EST.
```

---

# Shot Detection

## Strong signals

A paragraph is likely a shot if it begins with a shot-oriented phrase such as:

- ANGLE ON
- CLOSE ON
- WIDE SHOT
- POV
- INSERT
- CUTAWAY

Examples:

```text
ANGLE ON JOHN
CLOSE ON THE GUN
POV - DRIVER'S SEAT
INSERT - PHONE SCREEN
```

## Rule

If the paragraph starts with one of the recognized shot prefixes, classify as `shot`.

---

# Character Detection

## Strong signals

A paragraph is likely a character if:

- it is mostly uppercase
- it is relatively short
- it contains no sentence punctuation at the end, or minimal punctuation
- its indentation resembles character indentation
- it appears before likely dialogue

Examples:

```text
JOHN
MARY
DETECTIVE RAMIREZ
MOM (O.S.)
```

## Character name patterns to allow

The parser should permit character names containing:

- spaces
- apostrophes
- hyphens
- parenthetical suffixes such as:
  - (V.O.)
  - (O.S.)
  - (CONT'D)

Examples:

```text
DR. REYES
MOM (O.S.)
JACK JR.
O'BRIEN
ANNA-MARIE
```

## Rule

A paragraph should parse as `character` if all of the following are broadly true:

- uppercase-like
- short enough to plausibly be a character cue
- not recognized as scene, transition, shot, or parenthetical

## Length heuristic

Suggested v1 limit:

```text
<= 40 characters
```

This can be tuned later.

---

# Dialogue Inference

Dialogue is harder than the previous categories because it often depends on **context**, not just text shape.

## Strong signals

A paragraph is likely dialogue if:

- the previous paragraph is a Character or Parenthetical
- it is not all uppercase
- it is not a scene heading / transition / parenthetical / shot
- its indentation resembles dialogue indentation

Examples:

```text
I don't think that's a good idea.
Where are we going?
No.
```

## Rule

If the previous parsed paragraph is:

- `character`, or
- `parenthetical`

and the current paragraph is ordinary sentence text, classify as `dialogue`.

## Important Note

Dialogue should usually be inferred from context, not from punctuation alone.

---

# Action Fallback

If no strong parser rule matches, the paragraph should parse as:

**action**

This includes paragraphs like:

```text
John enters the room.
The rain gets louder.
She turns away from him.
```

Action is the default safe type.

---

# Formatting Fingerprint Rules

The formatting fingerprint is a secondary signal, not the primary truth source.

It helps resolve ambiguity.

## Useful signals

The parser may consult:

- alignment
- indentation
- uppercase-like appearance

Examples:

### Likely transition
- right aligned
- uppercase-like

### Likely character
- centered-ish or indented
- uppercase-like
- short

### Likely dialogue
- dialogue indentation
- sentence-like text

### Likely parenthetical
- parenthetical indentation
- parentheses text

---

# Context Rules

The parser may use nearby paragraph types to improve accuracy.

## Useful context examples

### Character -> Dialogue
If previous type is `character`, next ordinary sentence-like line is likely `dialogue`.

### Parenthetical -> Dialogue
If previous type is `parenthetical`, next ordinary sentence-like line is likely `dialogue`.

### Scene -> Action
If previous type is `scene`, next descriptive non-uppercase line is likely `action`.

## Important Constraint

Context should never override a very strong direct text rule.

Example:

If a paragraph begins with `INT.`, it is a scene heading even if previous context might suggest dialogue.

---

# Confidence Heuristics

For development, it is useful to think in confidence tiers.

## High confidence
- exact scene heading prefix
- exact transition phrase
- parentheses-wrapped short line after character
- recognized shot prefix

## Medium confidence
- uppercase short line with character indentation
- likely dialogue after character

## Low confidence
- plain sentence with weak indentation clues

If confidence is low, prefer `action`.

---

# Suggested Parser Pipeline

Recommended implementation order:

1. normalize text
2. if empty -> action
3. if parenthetical pattern -> parenthetical
4. if transition pattern -> transition
5. if scene heading pattern -> scene
6. if shot pattern -> shot
7. if character pattern -> character
8. if dialogue context rule applies -> dialogue
9. else -> action

Pseudo-code:

```ts
function parseParagraph(p: EngineParagraph): ParseResult {
  const t = normalizeText(p.text);

  if (isEmpty(t)) return actionResult();
  if (looksLikeParenthetical(t, p)) return parentheticalResult();
  if (looksLikeTransition(t, p)) return transitionResult();
  if (looksLikeSceneHeading(t, p)) return sceneResult();
  if (looksLikeShot(t, p)) return shotResult();
  if (looksLikeCharacter(t, p)) return characterResult();
  if (looksLikeDialogue(t, p)) return dialogueResult();
  return actionResult();
}
```

---

# Edge Cases

## Character with suffix

Examples:

```text
JOHN (V.O.)
MARY (O.S.)
DETECTIVE RAMIREZ (CONT'D)
```

These should still parse as `character`.

## Parenthetical after dialogue
A short parentheses line after dialogue may still be parenthetical if it is clearly a performance direction.

## Uppercase action
Sometimes action lines are uppercase for emphasis:

```text
THE DOOR EXPLODES OPEN.
```

This should **not automatically become character**.

Reason:
character detection requires short cue-like text, not just uppercase.

## One-word dialogue
Example:

```text
No.
```

If it follows a Character or Parenthetical, it should parse as dialogue.

## Single-word uppercase line
Example:

```text
RUN!
```

This is likely action, not character, because punctuation and exclamation imply action emphasis.

---

# Normalization Rules

Before parsing, text should be normalized in a minimal, non-destructive way:

- trim outer whitespace
- collapse repeated spaces for matching purposes only
- preserve original text separately
- uppercase comparisons should be done on a normalized copy, not by rewriting source text

The parser should never mutate the user's visible text.

---

# Parser Debugging

Development mode should optionally expose parser reasoning.

Example debug output:

```text
Paragraph: "JOHN"
Parsed as: character
Confidence: 0.91
Reasons:
- uppercase short line
- under character length threshold
- not matching scene or transition patterns
```

This is useful when tuning heuristics.

---

# Test Coverage Requirements

The parser should have automated tests for:

## Scene headings
- INT. HOUSE - NIGHT
- EXT. PARK - DAY
- INT/EXT. CAR - MOVING

## Transitions
- CUT TO:
- DISSOLVE TO:
- SMASH CUT TO:

## Parentheticals
- (whispering)
- (beat)
- (to John)

## Characters
- JOHN
- MARY (O.S.)
- DR. REYES

## Dialogue
- ordinary sentence after character
- ordinary sentence after parenthetical

## Action
- descriptive prose
- uppercase action emphasis
- ambiguous short lines

---

# Parser Non-Goals for V1

The v1 parser does not need to perfectly support:

- every international screenplay style
- stage play formatting
- lyric blocks
- dual dialogue
- production revision syntax
- highly custom user-defined element sets

These can be added later.

---

# Success Criteria

The parser is successful for v1 if it can reliably classify ordinary screenplay paragraphs in a way that makes the keyboard engine and formatter feel correct during actual writing.

That means:

- scene headings are recognized reliably
- character cues are recognized reliably
- dialogue follows character cues reliably
- transitions and parentheticals are rarely misclassified
- ambiguous lines fail safely to action

If that standard is met, the extension will feel stable enough to write in.