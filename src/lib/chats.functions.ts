import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { ChatAnswer, ChatMessage, Conversation, SavedEvidence } from "@/lib/types";

/**
 * Chat storage backend. Every function runs on the server as the signed-in
 * user, so row-level security scopes all reads and writes to that account.
 */

export const listConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Conversation[]> => {
    const { data, error } = await context.supabase
      .from("conversations")
      .select("id, title, messages, created_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      messages: (row.messages ?? []) as unknown as ChatMessage[],
      createdAt: new Date(row.created_at).getTime(),
      updatedAt: new Date(row.updated_at).getTime(),
    }));
  });

export const upsertConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; title: string; messages: ChatMessage[] }) => {
    if (!input?.id) throw new Error("A conversation id is required.");
    return {
      id: input.id,
      title: String(input.title ?? "New conversation").slice(0, 200),
      messages: Array.isArray(input.messages) ? input.messages.slice(0, 200) : [],
    };
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("conversations").upsert({
      id: data.id,
      user_id: context.userId,
      title: data.title,
      messages: data.messages as unknown as never,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => ({ id: String(input?.id ?? "") }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("conversations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listSavedEvidence = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SavedEvidence[]> => {
    const { data, error } = await context.supabase
      .from("saved_evidence")
      .select("id, question, answer, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      id: row.id,
      question: row.question,
      answer: row.answer as unknown as ChatAnswer,
      savedAt: new Date(row.created_at).getTime(),
    }));
  });

export const addSavedEvidence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; question: string; answer: ChatAnswer }) => {
    const question = String(input?.question ?? "").trim();
    if (!question) throw new Error("A question is required.");
    if (!input?.answer) throw new Error("An answer is required.");
    return { id: String(input.id), question: question.slice(0, 2000), answer: input.answer };
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("saved_evidence").insert({
      id: data.id,
      user_id: context.userId,
      question: data.question,
      answer: data.answer as unknown as never,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeSavedEvidence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => ({ id: String(input?.id ?? "") }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("saved_evidence").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
