export type ScreenplayElement =
  | "scene"
  | "action"
  | "character"
  | "dialogue"
  | "parenthetical"
  | "transition"
  | "shot";

export type FormattingFingerprint = {
  align: "left" | "right" | "center" | "unknown";
  indentStart: number | null;
  indentEnd: number | null;
  isUppercaseLike: boolean;
};

export type ParagraphRecord = {
  id: string;
  text: string;
  indexHint: number;
  isVisible: boolean;
  node: HTMLElement | null;
  formattingFingerprint?: FormattingFingerprint;
};

export type CaretPosition = {
  paragraphId: string | null;
  offset: number;
  isCollapsed: boolean;
};
