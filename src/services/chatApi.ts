import type { ChatAnswer } from "@/lib/types";
import { mockAnswer } from "@/lib/mock-data";

/**
 * ------------------------------------------------------------------
 * API SERVICE LAYER — the only file that talks to the backend.
 * ------------------------------------------------------------------
 * Configure the backend with `VITE_API_BASE_URL` in `.env`.
 * When it is not set, the UI falls back to mock data so the frontend
 * is fully usable without a backend.
 *
 * Change ENDPOINTS below if your backend uses different routes.
 */
export const API_BASE_URL: string = import.meta.env["VITE_API_BASE_URL"] ?? "";

export const ENDPOINTS = {
  chat: "/api/chat",
};

const MOCK_DELAY = Number(import.meta.env["VITE_MOCK_DELAY_MS"] ?? 900);

export interface AskQuestionPayload {
  question: string;
  conversationId?: string | undefined;
}

export class ApiError extends Error {
  status?: number | undefined;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Normalises any backend shape into the ChatAnswer used by the UI. */
export function normalizeAnswer(raw: Record<string, unknown>): ChatAnswer {
  const citations = Array.isArray(raw["citations"]) ? (raw["citations"] as any[]) : [];
  return {
    answer: String(raw["answer"] ?? ""),
    evidence_status: (raw["evidence_status"] as ChatAnswer["evidence_status"]) ?? "Moderate",
    evidence_grounded: raw["evidence_grounded"] !== false,
    source_traceable: raw["source_traceable"] !== false,
    reference_backed: raw["reference_backed"] !== false,
    evidence_match: Number(raw["evidence_match"] ?? 0),
    retrieved_count: raw["retrieved_count"] as number | undefined,
    passed_threshold_count: raw["passed_threshold_count"] as number | undefined,
    next_step: raw["next_step"] as string | undefined,
    follow_up_questions: (raw["follow_up_questions"] as string[] | undefined) ?? [],
    citations: citations.map((c, i) => ({
      id: String(c.id ?? c.chunk_id ?? `${c.source ?? "REF"}-${i}`),
      title: String(c.title ?? "Clinical Reference"),
      source: String(c.source ?? ""),
      page: c.page,
      chunk_id: c.chunk_id,
      section: c.section,
      year: c.year,
      score: c.score,
      passage: c.passage,
      used_in_answer: c.used_in_answer ?? true,
    })),
  };
}

export async function askQuestion(
  payload: AskQuestionPayload,
  signal?: AbortSignal,
): Promise<ChatAnswer> {
  if (!API_BASE_URL) {
    await new Promise((r) => setTimeout(r, MOCK_DELAY));
    if (/^error\b/i.test(payload.question.trim())) {
      throw new ApiError("Mock failure: the evidence service could not be reached.");
    }
    return mockAnswer(payload.question);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${ENDPOINTS.chat}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: payload.question,
        conversation_id: payload.conversationId,
      }),
      signal: signal ?? null,
    });
  } catch {
    throw new ApiError("Network error — could not reach the evidence service.");
  }

  if (!res.ok) {
    throw new ApiError(`Request failed with status ${res.status}.`, res.status);
  }

  return normalizeAnswer((await res.json()) as Record<string, unknown>);
}
