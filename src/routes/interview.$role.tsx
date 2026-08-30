import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bot, Send, Timer, User } from "lucide-react";

import { getRole, questionBank, type RoleId } from "@/lib/interview-data";
import { addTurn, resetSession } from "@/lib/session-store";

export const Route = createFileRoute("/interview/$role")({
  head: () => ({
    meta: [
      { title: "Live Mock Interview — InterviewPilot" },
      {
        name: "description",
        content: "Answer interview questions one at a time with a per-question timer.",
      },
      { property: "og:title", content: "Live Mock Interview — InterviewPilot" },
      {
        property: "og:description",
        content: "A focused, timed interview chat that scores every answer.",
      },
    ],
  }),
  loader: ({ params }) => {
    const role = getRole(params.role);
    if (!role) throw notFound();
    return { role };
  },
  component: InterviewPage,
});

const SECONDS_PER_QUESTION = 120;

type Message = { from: "ai" | "user"; text: string };

function InterviewPage() {
  const { role } = Route.useLoaderData();
  const navigate = useNavigate();
  const questions = questionBank[role.id as RoleId];

  const [index, setIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    { from: "ai", text: `Hi! I'm your interviewer for the ${role.title} role. Let's begin.` },
    { from: "ai", text: questions[0]! },
  ]);
  const [answer, setAnswer] = useState("");
  const [remaining, setRemaining] = useState(SECONDS_PER_QUESTION);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    resetSession();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setRemaining(SECONDS_PER_QUESTION);
    const id = setInterval(() => setRemaining((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [index]);

  const total = questions.length;
  const progress = Math.round((index / total) * 100);
  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");
  const low = remaining <= 20;

  function submit() {
    const text = answer.trim();
    if (!text) return;

    addTurn({
      question: questions[index]!,
      answer: text,
      seconds: SECONDS_PER_QUESTION - remaining,
    });
    setAnswer("");

    const next = index + 1;
    if (next >= total) {
      setMessages((m) => [
        ...m,
        { from: "user", text },
        { from: "ai", text: "That's the last question — generating your report card…" },
      ]);
      setTimeout(() => navigate({ to: "/report/$role", params: { role: role.id } }), 900);
      return;
    }

    setMessages((m) => [...m, { from: "user", text }, { from: "ai", text: questions[next]! }]);
    setIndex(next);
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-base font-semibold">
            InterviewPilot
          </Link>
          <span className="text-xs uppercase tracking-[0.16em] text-primary-foreground/70">
            {role.title}
          </span>
        </div>
      </header>

      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-3">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>
                Question {index + 1} of {total}
              </span>
              <span>{progress}% complete</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.max(progress, 6)}%` }}
              />
            </div>
          </div>
          <div
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-display text-sm font-semibold tabular-nums ${
              low ? "bg-destructive/10 text-destructive" : "bg-secondary text-secondary-foreground"
            }`}
          >
            <Timer className="size-4" />
            {mins}:{secs}
          </div>
        </div>
      </div>

      <section className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-6 py-8">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-3 ${m.from === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                m.from === "ai"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {m.from === "ai" ? <Bot className="size-4" /> : <User className="size-4" />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.from === "ai"
                  ? "surface-card rounded-tl-sm text-foreground"
                  : "rounded-tr-sm bg-primary text-primary-foreground"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </section>

      <footer className="sticky bottom-0 border-t border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-end gap-3 px-6 py-4">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            placeholder="Type your answer… (Enter to send, Shift+Enter for a new line)"
            className="min-h-[56px] flex-1 resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            onClick={submit}
            disabled={!answer.trim()}
            className="inline-flex h-[56px] items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Send className="size-4" />
            {index + 1 === total ? "Finish" : "Send"}
          </button>
        </div>
      </footer>
    </main>
  );
}
