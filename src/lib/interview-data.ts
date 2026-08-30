export type RoleId = "sde-intern" | "data-analyst" | "frontend-developer";

export type Role = {
  id: RoleId;
  title: string;
  blurb: string;
  focus: string[];
  duration: string;
};

export const roles: Role[] = [
  {
    id: "sde-intern",
    title: "SDE Intern",
    blurb: "Fundamentals, problem solving and how you reason through code.",
    focus: ["Data structures", "Debugging", "Projects"],
    duration: "5 questions · ~12 min",
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    blurb: "SQL thinking, metrics sense and communicating insights clearly.",
    focus: ["SQL", "Statistics", "Storytelling"],
    duration: "5 questions · ~12 min",
  },
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    blurb: "UI architecture, performance and accessible interface craft.",
    focus: ["React", "Performance", "Accessibility"],
    duration: "5 questions · ~12 min",
  },
];

export function getRole(id: string): Role | undefined {
  return roles.find((r) => r.id === id);
}

export const questionBank: Record<RoleId, string[]> = {
  "sde-intern": [
    "Tell me about yourself and what drew you to software engineering.",
    "Walk me through a project you built. What was the hardest bug you fixed?",
    "How would you find the first non-repeating character in a string? Explain your approach.",
    "Explain the difference between a stack and a queue with a real use case for each.",
    "You are given a task with unclear requirements. What do you do first?",
  ],
  "data-analyst": [
    "Introduce yourself and describe the kind of data you enjoy working with.",
    "A daily active users metric drops 20% overnight. How do you investigate?",
    "Explain the difference between correlation and causation using an example.",
    "How would you write a query to find the top 3 products by revenue per region?",
    "How do you present an unpopular finding to stakeholders?",
  ],
  "frontend-developer": [
    "Tell me about yourself and the interfaces you're most proud of building.",
    "How do you decide between local state, context and a data-fetching cache?",
    "A page feels slow on mobile. Walk me through how you diagnose and fix it.",
    "What does accessible mean to you in practice for a custom dropdown?",
    "How do you keep a design system consistent as a codebase grows?",
  ],
};

const q = (role: RoleId, i: number): string => questionBank[role][i]!;

export type QuestionScore = {
  question: string;
  score: number;
  note: string;
};

export type Report = {
  overall: number;
  scores: QuestionScore[];
  strengths: string[];
  weaknesses: string[];
  weakestIndex: number;
  modelAnswer: string;
};

const reports: Record<RoleId, Report> = {
  "sde-intern": {
    overall: 7.2,
    scores: [
      { question: q("sde-intern", 0), score: 8, note: "Clear, well-paced intro with a concrete motivation." },
      { question: q("sde-intern", 1), score: 7, note: "Good project detail, light on the debugging process." },
      { question: q("sde-intern", 2), score: 6, note: "Correct idea, but complexity was never stated." },
      { question: q("sde-intern", 3), score: 9, note: "Crisp definitions with strong real-world examples." },
      { question: q("sde-intern", 4), score: 5, note: "Jumped to coding instead of clarifying requirements." },
    ],
    strengths: [
      "Explains core CS concepts in plain language with useful examples.",
      "Comfortable, confident delivery — no filler, good structure.",
    ],
    weaknesses: [
      "Rarely states time and space complexity unprompted.",
      "Starts solving before confirming what the problem actually is.",
    ],
    weakestIndex: 4,
    modelAnswer:
      "Before writing any code I'd reduce ambiguity. First I'd restate the task back to whoever owns it and list what I think the inputs, outputs and success criteria are. Then I'd write down my assumptions and the two or three open questions that would actually change my implementation — for example expected data volume, error handling and who consumes the result. I'd ask those in one batch rather than trickling them out. If nobody is available, I'd pick the most conservative interpretation, build a small vertical slice, and share it early so feedback corrects me cheaply. Finally I'd document the assumptions in the pull request so the reviewer can spot a wrong one instantly.",
  },
  "data-analyst": {
    overall: 7.0,
    scores: [
      { question: q("data-analyst", 0), score: 8, note: "Grounded intro tied to real datasets." },
      { question: q("data-analyst", 1), score: 6, note: "Missed checking for instrumentation/logging breakage." },
      { question: q("data-analyst", 2), score: 8, note: "Solid example, clearly explained." },
      { question: q("data-analyst", 3), score: 8, note: "Correct window-function approach." },
      { question: q("data-analyst", 4), score: 5, note: "Focused on the chart, not on the decision it drives." },
    ],
    strengths: [
      "Strong SQL instincts — reaches for window functions naturally.",
      "Explains statistical ideas without jargon.",
    ],
    weaknesses: [
      "Skips data-quality checks before jumping to business causes.",
      "Framing for stakeholders lacks a clear recommendation.",
    ],
    weakestIndex: 4,
    modelAnswer:
      "I'd lead with the decision, not the data. I'd open with one sentence stating the finding and what I recommend, then show the two charts that make it undeniable, including the confidence and known caveats. I'd pre-empt the obvious objections — sample size, seasonality, tracking changes — because an unpopular result gets attacked on methodology first. I'd bring the owner of the affected area into a short conversation before the wider meeting so they aren't blindsided. Finally I'd end with options rather than a verdict: what we do if we accept the finding, what we'd need to see to overturn it, and the cheapest experiment that would settle it.",
  },
  "frontend-developer": {
    overall: 7.4,
    scores: [
      { question: q("frontend-developer", 0), score: 8, note: "Great ownership signals in the projects described." },
      { question: q("frontend-developer", 1), score: 8, note: "Sensible boundaries between server and client state." },
      { question: q("frontend-developer", 2), score: 7, note: "Good instincts, but no mention of measuring first." },
      { question: q("frontend-developer", 3), score: 5, note: "Covered visuals; keyboard and ARIA semantics were thin." },
      { question: q("frontend-developer", 4), score: 9, note: "Excellent, practical view on tokens and review culture." },
    ],
    strengths: [
      "Thinks in systems — tokens, variants and reuse, not one-off styles.",
      "Clear reasoning about where state should live.",
    ],
    weaknesses: [
      "Accessibility answers stay at the visual level.",
      "Optimises before profiling with real device data.",
    ],
    weakestIndex: 3,
    modelAnswer:
      "Accessible means the dropdown works identically without a mouse and makes sense to a screen reader. Concretely: the trigger is a real button with aria-haspopup=\"listbox\" and aria-expanded, the list uses role=\"listbox\" with role=\"option\" children, and the active option is linked via aria-activedescendant. Arrow keys move the highlight, Home and End jump to the ends, typing jumps to a matching option, Enter or Space selects, and Escape closes and returns focus to the trigger. Focus is trapped while open and restored on close, the open state is announced, and every state is visible at 200% zoom and in high-contrast mode. I'd verify it with keyboard-only navigation plus VoiceOver before calling it done.",
  },
};

export function getReport(id: RoleId): Report {
  return reports[id];
}
