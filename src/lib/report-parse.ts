import type { Report, RoleId } from "./interview-data";

const KEY = "interviewpilot:report";

export function extractReport(text: string): Report | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1] ?? (text.trim().startsWith("{") ? text.trim() : null);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<Report>;
    if (!Array.isArray(parsed.scores) || parsed.scores.length === 0) return null;

    const scores = parsed.scores.map((s) => ({
      question: String(s.question ?? ""),
      score: Math.max(0, Math.min(10, Number(s.score) || 0)),
      note: String(s.note ?? ""),
    }));
    const lowest = scores.reduce(
      (best, s, i) => (s.score < scores[best]!.score ? i : best),
      0,
    );
    const weakestIndex =
      typeof parsed.weakestIndex === "number" &&
      parsed.weakestIndex >= 0 &&
      parsed.weakestIndex < scores.length
        ? parsed.weakestIndex
        : lowest;

    return {
      overall:
        Number(parsed.overall) ||
        Number((scores.reduce((a, s) => a + s.score, 0) / scores.length).toFixed(1)),
      scores,
      strengths: (parsed.strengths ?? []).map(String).slice(0, 4),
      weaknesses: (parsed.weaknesses ?? []).map(String).slice(0, 4),
      weakestIndex,
      modelAnswer: String(parsed.modelAnswer ?? ""),
    };
  } catch {
    return null;
  }
}

export function storeReport(role: RoleId, report: Report) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ role, report }));
  } catch {
    /* ignore */
  }
}

export function loadReport(role: RoleId): Report | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { role: RoleId; report: Report };
    return parsed.role === role ? parsed.report : null;
  } catch {
    return null;
  }
}
