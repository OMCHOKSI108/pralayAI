import { createContext, useState, useCallback, useRef } from "react";
import { streamChat, getConversations, getConversation, deleteConversation } from "../config/PralayAPI";

export const Context = createContext();

let msgIdCounter = 0;
function nextId() {
  return `msg-${++msgIdCounter}-${Date.now()}`;
}

const ContextProvider = ({ children }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);
  const abortRef = useRef(null);

  // Enhanced state for new features
  const [currentSkill, setCurrentSkill] = useState(null);
  const [currentProcess, setCurrentProcess] = useState(null);
  const [currentCitations, setCurrentCitations] = useState([]);
  const [memoryUsed, setMemoryUsed] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const loadConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load conversations:", e);
    }
  }, []);

  const newChat = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setConversationId(null);
    setInput("");
    setError(null);
    setLoading(false);
    setIsGenerating(false);
    setCurrentSkill(null);
    setCurrentProcess(null);
    setCurrentCitations([]);
    setMemoryUsed(false);
    setStatusMessage("");
  }, []);

  const loadConversationById = useCallback(async (id) => {
    if (!id) return;
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(true);
    setError(null);
    try {
      const detail = await getConversation(id);
      if (!detail) {
        setError("Conversation not found.");
        return;
      }
      const msgs = detail.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.created_at,
        status: "done",
      }));
      setMessages(msgs);
      setConversationId(id);
    } catch (e) {
      setError("Failed to load conversation.");
      console.error(e);
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  }, []);

  const removeConversation = useCallback(async (id) => {
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (conversationId === id) newChat();
    } catch (e) {
      console.error("Failed to delete conversation:", e);
    }
  }, [conversationId, newChat]);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const onSent = useCallback(async (prompt) => {
    const messageText = (prompt !== undefined ? prompt : input).trim();
    if (!messageText || loading) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setLoading(true);
    setIsGenerating(true);
    setInput("");
    setCurrentSkill(null);
    setCurrentProcess(null);
    setCurrentCitations([]);
    setMemoryUsed(false);
    setStatusMessage("");

    const userMsgId = nextId();
    const assistantMsgId = nextId();

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: messageText, timestamp: new Date().toISOString(), status: "done" },
      { id: assistantMsgId, role: "assistant", content: "", timestamp: new Date().toISOString(), status: "streaming" },
    ]);

    let accumulated = "";

    await streamChat({
      message: messageText,
      conversationId,
      signal: controller.signal,
      onEvent: (event) => {
        switch (event.type) {
          case "skill":
            setCurrentSkill(event.data.skill || event.data.data?.skill);
            break;
          case "status":
            setStatusMessage(event.data.message || event.data.data?.message);
            break;
          case "memory":
            setMemoryUsed(event.data.used || event.data.data?.used);
            break;
          case "process":
            setCurrentProcess(event.data.data || event.data);
            break;
          case "citations":
            const cit = event.data.data || event.data;
            if (Array.isArray(cit)) {
              setCurrentCitations(cit);
            } else if (cit.citations) {
              setCurrentCitations(cit.citations);
            }
            break;
          case "sources":
          case "source":
            break;
        }
      },
      onToken(token) {
        accumulated += token;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: accumulated, status: "streaming" }
              : m
          )
        );
      },
      onDone({ conversationId: cid, stopped, status }) {
        if (cid) setConversationId(cid);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, status: stopped ? "stopped" : "done" }
              : m
          )
        );
        loadConversations();
        setLoading(false);
        setIsGenerating(false);
        setStatusMessage("");
        abortRef.current = null;
      },
      onError(err) {
        const msg = err?.message || "Something went wrong. Try again.";
        setError(msg);
        setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
        setLoading(false);
        setIsGenerating(false);
        setStatusMessage("");
        abortRef.current = null;
      },
    });
  }, [input, conversationId, loading, loadConversations]);

  const contextValue = {
    input, setInput,
    messages, setMessages,
    loading, isGenerating,
    error, setError,
    conversationId, setConversationId,
    conversations,
    currentSkill, currentProcess, currentCitations, memoryUsed, statusMessage,
    onSent, newChat, stopGeneration,
    loadConversations, loadConversationById, removeConversation,
  };

  return (
    <Context.Provider value={contextValue}>{children}</Context.Provider>
  );
};

export default ContextProvider;
