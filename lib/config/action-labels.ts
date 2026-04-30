export const ACTION_LABELS = [
  "Strong Buy",
  "Buy",
  "Buy Small",
  "Add",
  "Hold",
  "Hold / Wait",
  "Trim",
  "Sell Partial",
  "Sell",
  "Avoid",
  "Covered Call Candidate",
  "Cash-Secured Put Candidate",
  "Poor Man's Covered Call Candidate",
  "No Action",
] as const;

export type ActionLabel = (typeof ACTION_LABELS)[number];
