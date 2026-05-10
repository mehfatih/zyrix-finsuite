// ================================================================
// Sprint D-8 — ChatContext.
//
// Global open/close state for the floating chat panel + the active
// conversation id. Mirrors the CmdKContext shape from the existing
// command-palette implementation.
//
// Hotkey: Cmd+J / Ctrl+J (decision §7.B). Existing CmdKContext
// keeps Cmd+K bound to the command palette — the two contexts
// coexist without conflict.
// ================================================================
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

const ChatCtx = createContext(null);

export function ChatProvider({ children }) {
  const [open, setOpen]                       = useState(false);
  const [hasMounted, setHasMounted]           = useState(false);
  const [activeConversationId, setActiveId]   = useState(null);
  const [pendingPrompt, setPendingPrompt]     = useState(null);
  const triggerRef = useRef(null);

  const openChat = useCallback((opts = {}) => {
    setHasMounted(true);
    setOpen(true);
    if (opts.conversationId !== undefined) setActiveId(opts.conversationId || null);
    if (opts.prompt) setPendingPrompt(String(opts.prompt));
  }, []);

  const closeChat = useCallback(() => {
    setOpen(false);
  }, []);

  const toggleChat = useCallback(() => {
    setHasMounted(true);
    setOpen((o) => !o);
  }, []);

  const consumePendingPrompt = useCallback(() => {
    const p = pendingPrompt;
    setPendingPrompt(null);
    return p;
  }, [pendingPrompt]);

  useEffect(() => {
    const onKey = (e) => {
      // Cmd+J (Mac) / Ctrl+J (Win/Linux). Decision §7.B.
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        triggerRef.current = e.target;
        toggleChat();
      }
      // Esc closes when open.
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        closeChat();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, toggleChat, closeChat]);

  return (
    <ChatCtx.Provider
      value={{
        open,
        hasMounted,
        activeConversationId,
        setActiveConversationId: setActiveId,
        openChat,
        closeChat,
        toggleChat,
        pendingPrompt,
        consumePendingPrompt
      }}
    >
      {children}
    </ChatCtx.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatCtx);
  if (!ctx) {
    // Soft fallback so consumers don't crash if the provider isn't
    // mounted (e.g., during pre-auth pages).
    return {
      open: false,
      hasMounted: false,
      activeConversationId: null,
      setActiveConversationId: () => undefined,
      openChat: () => undefined,
      closeChat: () => undefined,
      toggleChat: () => undefined,
      pendingPrompt: null,
      consumePendingPrompt: () => null
    };
  }
  return ctx;
}
