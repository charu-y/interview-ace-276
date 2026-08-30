import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Timer, User } from "lucide-react";

import { getRole, type RoleId } from "@/lib/interview-data";
import { askInterviewer, type ChatMessage } from "@/lib/interview.functions";
import { extractReport, storeReport } from "@/lib/report-parse";
import { addTurn, resetSession } from "@/lib/session-store";

export const Route = createFileRoute("/interview/$role")({
  head: () => ({
    meta: [
      { title: "Live Mock Interview — InterviewPilot" },
      {
        name: "description",
        content: "Answer AI interview questions one at a time with a per-question timer.",
      },
      { property: "og:title", content: "Live Mock Interview — InterviewPilot" },
      {
        property: "og:description",
        content: "A focused, timed AI interview chat that scores every answer.",
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
const TOTAL_QUESTIONS = 5;

function InterviewPage() {
  const { role } = Route.useLoaderData();
  const navigate = useNavigate();
  const ask = useServerFn(askInterviewer);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answer, setAnswer] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asked, setAsked] = useState(0);
  const [remaining, setRemaining] = useState(SECONDS_PER_QUESTION);
  const bottomRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => {
    setRemaining(SECONDS_PER_QUESTION);
    const id = setInterval(() => setRemaining((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [asked]);

  async function send(history: ChatMessage[]) {
    setThinking(true);
    setError(null);
    try {
      const { content } = await ask({ data: { role: role.id as RoleId, messages: history } });
      const report = extractReport(content);
      if (report) {
        storeReport(role.id as RoleId, report);
        setMessages([
          ...history,
          {
            role: "assistant",
            content: "That's the last question — generating your report card…",
          },
        ]);
        setTimeout(() => navigate({ to: "/report/$role", params: { role: role.id } }), 800);
        return;
      }
      setMessages([...history, { role: "assistant", content }]);
      setAsked((n) => Math.min(n + 1, TOTAL_QUESTIONS));
    } catch (e) {
      setMessages(history);
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setThinking(false);
    }
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    resetSession();
    void send([
      { role: "user", content: `I'm ready. Please begin the interview for the ${role.title} role with question 1.` },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentQuestion = Math.min(asked || 1, TOTAL_QUESTIONS);
  const progress = Math.round(((asked ? asked - 1 : 0) / TOTAL_QUESTIONS) * 100);
  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");
  const low = remaining <= 20;
  const lastQuestion =
    [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "";

  function submit() {
    const text = answer.trim();
    if (!text || thinking) return;

    addTurn({
      question: lastQuestion,
      answer: text,
      seconds: SECONDS_PER_QUESTION - remaining,
    });
    setAnswer("");
    void send([...messages, { role: "user", content: text }]);
  }

  const visible = messages.filter((_, i) => i !== 0);

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
                Question {currentQuestion} of {TOTAL_QUESTIONS}
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
        {visible.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                m.role === "assistant"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {m.role === "assistant" ? <Bot className="size-4" /> : <User className="size-4" />}
            </div>
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "assistant"
                  ? "surface-card rounded-tl-sm text-foreground"
                  : "rounded-tr-sm bg-primary text-primary-foreground"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bot className="size-4" />
            </div>
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Interviewer is thinking…
            </span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
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
            disabled={!answer.trim() || thinking}
            className="inline-flex h-[56px] items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Send className="size-4" />
            {asked >= TOTAL_QUESTIONS ? "Finish" : "Send"}
          </button>
        </div>
      </footer>
    </main>
  );
}
