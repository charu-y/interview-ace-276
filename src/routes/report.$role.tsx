import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, AlertTriangle, Lightbulb, RotateCcw } from "lucide-react";

import { getReport, getRole, type RoleId } from "@/lib/interview-data";

export const Route = createFileRoute("/report/$role")({
  head: () => ({
    meta: [
      { title: "Interview Report Card — InterviewPilot" },
      {
        name: "description",
        content:
          "Your scored mock interview report: per-question scores, strengths, weaknesses and a model answer.",
      },
      { property: "og:title", content: "Interview Report Card — InterviewPilot" },
      {
        property: "og:description",
        content: "See how you scored and how to answer your weakest question better.",
      },
    ],
  }),
  loader: ({ params }) => {
    const role = getRole(params.role);
    if (!role) throw notFound();
    return { role, report: getReport(role.id as RoleId) };
  },
  component: ReportPage,
});

function scoreTone(score: number) {
  if (score >= 8) return "text-success";
  if (score >= 6) return "text-warning";
  return "text-destructive";
}

function ReportPage() {
  const { role, report } = Route.useLoaderData();
  const weakest = report.scores[report.weakestIndex]!;

  return (
    <main className="min-h-screen bg-background pb-20">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <Link to="/" className="font-display text-base font-semibold">
            InterviewPilot
          </Link>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">
                Report card · {role.title}
              </p>
              <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
                Here's how the interview went.
              </h1>
            </div>
            <div className="rounded-2xl bg-primary-foreground/10 px-6 py-4 text-center">
              <p className="font-display text-4xl font-semibold tabular-nums">
                {report.overall.toFixed(1)}
                <span className="text-xl text-primary-foreground/60">/10</span>
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-primary-foreground/70">
                Overall
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pt-10">
        <h2 className="text-lg font-semibold text-foreground">Question breakdown</h2>
        <div className="mt-4 space-y-3">
          {report.scores.map((s, i) => (
            <article key={i} className="surface-card rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-semibold text-foreground">
                  <span className="mr-2 text-muted-foreground">Q{i + 1}.</span>
                  {s.question}
                </p>
                <p className={`font-display text-lg font-semibold tabular-nums ${scoreTone(s.score)}`}>
                  {s.score}
                  <span className="text-sm text-muted-foreground">/10</span>
                </p>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${s.score * 10}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{s.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-4xl gap-5 px-6 pt-10 md:grid-cols-2">
        <div className="surface-card rounded-xl p-6">
          <h2 className="inline-flex items-center gap-2 text-base font-semibold text-foreground">
            <CheckCircle2 className="size-5 text-success" /> Strengths
          </h2>
          <ul className="mt-4 space-y-3">
            {report.strengths.map((s) => (
              <li key={s} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-success" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-card rounded-xl p-6">
          <h2 className="inline-flex items-center gap-2 text-base font-semibold text-foreground">
            <AlertTriangle className="size-5 text-warning" /> Areas to improve
          </h2>
          <ul className="mt-4 space-y-3">
            {report.weaknesses.map((w) => (
              <li key={w} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-warning" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pt-10">
        <div className="rounded-2xl bg-primary p-6 text-primary-foreground sm:p-8">
          <h2 className="inline-flex items-center gap-2 text-base font-semibold">
            <Lightbulb className="size-5" /> Model answer for your weakest response
          </h2>
          <p className="mt-4 text-sm font-medium text-primary-foreground/70">
            Q{report.weakestIndex + 1}. {weakest.question} · scored {weakest.score}/10
          </p>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/90">
            {report.modelAnswer}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/interview/$role"
            params={{ role: role.id }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <RotateCcw className="size-4" /> Retry this interview
          </Link>
          <Link
            to="/"
            className="inline-flex items-center rounded-xl border border-input px-5 py-3 text-sm font-semibold text-foreground hover:bg-secondary"
          >
            Pick another role
          </Link>
        </div>
      </section>
    </main>
  );
}
