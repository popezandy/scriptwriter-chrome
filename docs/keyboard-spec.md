# Keyboard Interaction Specification

This document defines the keyboard behavior for the screenplay editing extension.

The goal is to replicate the **keyboard workflow used by professional screenplay editors** such as Final Draft and Trelby.

Keyboard input controls screenplay **element transitions**.

---

# Screenplay Elements

Supported elements:

Scene Heading  
Action  
Character  
Dialogue  
Parenthetical  
Transition  
Shot

Every paragraph belongs to one element type.

---

# Tab Key

Tab cycles the current paragraph through screenplay elements.

Default cycle order:

Action → Character → Dialogue → Parenthetical → Dialogue → Action

If the paragraph is empty, Tab simply changes its element type.

---

# Shift + Tab

Shift + Tab cycles the element type **in reverse**.

Example:

Action ← Character ← Dialogue ← Parenthetical

---

# Enter Key

Enter inserts a new paragraph with the **next logical screenplay element**.

Transition table:

Current Element | Next Element
--- | ---
Scene Heading | Action
Action | Action
Character | Dialogue
Parenthetical | Dialogue
Dialogue | Action
Transition | Scene Heading
Shot | Action

---

# Autocomplete Navigation

When autocomplete suggestions are visible:

Key | Action
--- | ---
Arrow Up | Move selection up
Arrow Down | Move selection down
Enter | Accept suggestion
Tab | Accept suggestion
Escape | Close suggestion list

---

# Caret Preservation

After element transitions or formatting changes, the extension must restore the caret position to the expected typing location.

---

# Future Shortcuts (Planned)

Cmd/Ctrl + 1 → Scene Heading  
Cmd/Ctrl + 2 → Action  
Cmd/Ctrl + 3 → Character  
Cmd/Ctrl + 4 → Dialogue  
Cmd/Ctrl + 5 → Parenthetical  
Cmd/Ctrl + 6 → Transition

These shortcuts are planned for later versions.