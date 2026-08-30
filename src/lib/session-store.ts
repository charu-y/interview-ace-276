// In-memory transcript for the current mock interview (dummy stage — no backend yet).
export type Turn = { question: string; answer: string; seconds: number };

let transcript: Turn[] = [];

export function resetSession() {
  transcript = [];
}

export function addTurn(turn: Turn) {
  transcript = [...transcript, turn];
}

export function getTranscript(): Turn[] {
  return transcript;
}
