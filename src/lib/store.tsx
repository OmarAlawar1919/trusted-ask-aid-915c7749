import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ChatAnswer, Conversation, SavedEvidence } from "./types";
import { mockConversations } from "./mock-data";
import { API_BASE_URL } from "@/services/chatApi";
import { supabase } from "@/integrations/supabase/client";
import {
  addSavedEvidence,
  listConversations,
  listSavedEvidence,
  removeConversation,
  removeSavedEvidence,
  upsertConversation,
} from "./chats.functions";

/**
 * Client-side app state (conversations + saved evidence).
 *
 * Signed-out visitors keep everything in localStorage. Once a user is signed
 * in, conversations and saved evidence are read from and written to the
 * database through authenticated server functions.
 */

const CONV_KEY = "teryaq.conversations";
const SAVED_KEY = "teryaq.saved";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

interface StoreValue {
  hydrated: boolean;
  userId: string | null;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  conversations: Conversation[];
  saved: SavedEvidence[];
  setConversations: (updater: (prev: Conversation[]) => Conversation[]) => void;
  createConversation: () => Conversation;
  deleteConversation: (id: string) => void;
  saveEvidence: (question: string, answer: ChatAnswer) => void;
  removeSaved: (id: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [conversations, setConvs] = useState<Conversation[]>([]);
  const [saved, setSaved] = useState<SavedEvidence[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const syncedRef = useRef(new Map<string, string>());

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      setUserId(session?.user.id ?? null),
    );
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setHydrated(false);
    syncedRef.current = new Map();

    if (!userId) {
      const stored = read<Conversation[] | null>(CONV_KEY, null);
      // Seed with mock conversations only while no backend is configured.
      setConvs(stored ?? (API_BASE_URL ? [] : mockConversations));
      setSaved(read<SavedEvidence[]>(SAVED_KEY, []));
      setHydrated(true);
      return;
    }

    void (async () => {
      try {
        const [convs, savedRows] = await Promise.all([listConversations(), listSavedEvidence()]);
        if (cancelled) return;
        convs.forEach((c) => syncedRef.current.set(c.id, JSON.stringify(c.messages)));
        setConvs(convs);
        setSaved(savedRows);
      } catch (error) {
        console.error("Failed to load conversations", error);
        if (!cancelled) {
          setConvs([]);
          setSaved([]);
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Persist locally for signed-out visitors.
  useEffect(() => {
    if (hydrated && !userId) {
      window.localStorage.setItem(CONV_KEY, JSON.stringify(conversations));
    }
  }, [conversations, hydrated, userId]);

  useEffect(() => {
    if (hydrated && !userId) window.localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }, [saved, hydrated, userId]);

  // Persist changed conversations to the database for signed-in users.
  useEffect(() => {
    if (!hydrated || !userId) return;
    const timer = window.setTimeout(() => {
      conversations.forEach((conv) => {
        const snapshot = JSON.stringify(conv.messages);
        if (syncedRef.current.get(conv.id) === snapshot) return;
        syncedRef.current.set(conv.id, snapshot);
        void upsertConversation({
          data: { id: conv.id, title: conv.title, messages: conv.messages },
        }).catch((error) => {
          syncedRef.current.delete(conv.id);
          console.error("Failed to save conversation", error);
        });
      });
    }, 600);
    return () => window.clearTimeout(timer);
  }, [conversations, hydrated, userId]);

  const setConversations = useCallback(
    (updater: (prev: Conversation[]) => Conversation[]) => setConvs(updater),
    [],
  );

  const createConversation = useCallback(() => {
    const conv: Conversation = {
      id: uid(),
      title: "New conversation",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setConvs((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    return conv;
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConvs((prev) => prev.filter((c) => c.id !== id));
      syncedRef.current.delete(id);
      if (userId) {
        void removeConversation({ data: { id } }).catch((error) =>
          console.error("Failed to delete conversation", error),
        );
      }
    },
    [userId],
  );

  const saveEvidence = useCallback(
    (question: string, answer: ChatAnswer) => {
      const entry: SavedEvidence = { id: uid(), question, answer, savedAt: Date.now() };
      setSaved((prev) => [entry, ...prev]);
      if (userId) {
        void addSavedEvidence({ data: { id: entry.id, question, answer } }).catch((error) =>
          console.error("Failed to save evidence", error),
        );
      }
    },
    [userId],
  );

  const removeSaved = useCallback(
    (id: string) => {
      setSaved((prev) => prev.filter((s) => s.id !== id));
      if (userId) {
        void removeSavedEvidence({ data: { id } }).catch((error) =>
          console.error("Failed to remove saved evidence", error),
        );
      }
    },
    [userId],
  );

  const value = useMemo(
    () => ({
      hydrated,
      userId,
      activeId,
      setActiveId,
      conversations,
      saved,
      setConversations,
      createConversation,
      deleteConversation,
      saveEvidence,
      removeSaved,
    }),
    [
      hydrated,
      userId,
      activeId,
      conversations,
      saved,
      setConversations,
      createConversation,
      deleteConversation,
      saveEvidence,
      removeSaved,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

export function formatRelative(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const d = new Date(ts);
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 1000 * 60 * 60 * 24) return `Today · ${time}`;
  return `${d.toLocaleDateString()} · ${time}`;
}
