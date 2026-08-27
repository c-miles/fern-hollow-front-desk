export type Policy = { id: string; title: string; body: string };

export type LogEntry = {
  id: string;
  question: string;
  answer: string;
  citedPolicyIds: string[];
  outcome: "answered" | "no_match" | "escalated";
  createdAt: string;
};
