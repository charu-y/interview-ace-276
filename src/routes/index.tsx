import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Target, Sparkles } from "lucide-react";

import { roles } from "@/lib/interview-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "InterviewPilot — Pick Your Mock Interview Role" },
      {
        name: "description",
        content:
          "Choose SDE Intern, Data Analyst or Frontend Developer and start a timed mock interview with an instant report card.",
      },
      { property: "og:title", content: "InterviewPilot — Pick Your Mock Interview Role" },
      {
        property: "og:description",
        content: "Timed practice interviews with per-question scoring and a model answer.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <span className="font-display text-lg font-semibold tracking-tight">InterviewPilot</span>
          <span className="hidden text-xs uppercase tracking-[0.18em] text-primary-foreground/70 sm:block">
            Mock interview studio
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-16 pb-10">
        <p className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-secondary-foreground">
          <Sparkles className="size-3.5" /> Step 1 of 3
        </p>
        <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.1] text-foreground sm:text-5xl">
          Choose the role you want to be interviewed for.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          Five questions, one at a time, on a timer — followed by a scored report card with
          strengths, weaknesses and a model answer.
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-6 pb-20 md:grid-cols-3">
        {roles.map((role) => (
          <Link
            key={role.id}
            to="/interview/$role"
            params={{ role: role.id }}
            className="surface-card group flex flex-col rounded-2xl p-6 transition-all hover:-translate-y-1 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Target className="size-5" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-foreground">{role.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{role.blurb}</p>

            <ul className="mt-4 flex flex-wrap gap-2">
              {role.focus.map((f) => (
                <li
                  key={f}
                  className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                >
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-4" /> {role.duration}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-primary">
                Start <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
