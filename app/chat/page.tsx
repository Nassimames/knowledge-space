"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import {
  ChatTranscript,
  ConversationSidebar,
  handleComposerKeyDown,
} from "@/app/chat/chat-components";
import {
  fetchConversation,
  fetchConversations,
  fetchDocuments,
  sendChatMessage,
} from "@/lib/api";
import type { ChatMessage } from "@/types/chat";
import type { DocumentResponse } from "@/types/documents";

export default function ChatPage() {
  const [conversations, setConversations] = useState<
    Awaited<ReturnType<typeof fetchConversations>>["items"]
  >([]);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const refreshConversations = useCallback(async () => {
    const page = await fetchConversations();
    setConversations(page.items);
    return page.items;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([fetchDocuments(controller.signal), fetchConversations(controller.signal)])
      .then(([documentPage, conversationPage]) => {
        setDocuments(documentPage.items);
        setConversations(conversationPage.items);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setErrorMessage(error instanceof Error ? error.message : "Unable to load the assistant.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [question]);

  useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isSidebarOpen]);

  const openConversation = async (id: string) => {
    setErrorMessage(null);
    setIsSidebarOpen(false);
    setIsLoading(true);
    try {
      const conversation = await fetchConversation(id);
      setConversationId(conversation.id);
      setMessages(conversation.messages);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to open this conversation.");
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    setQuestion("");
    setErrorMessage(null);
    setIsSidebarOpen(false);
    textareaRef.current?.focus();
  };

  const submitQuestion = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isSending) {
      return;
    }

    setIsSending(true);
    setQuestion("");
    setErrorMessage(null);
    try {
      const result = await sendChatMessage({
        question: trimmedQuestion,
        ...(conversationId ? { conversation_id: conversationId } : {}),
        ...(selectedDocumentId ? { document_id: selectedDocumentId } : {}),
      });
      const timestamp = new Date().toISOString();
      const userMessage: ChatMessage = {
        id: `user-${timestamp}`,
        role: "user",
        content: trimmedQuestion,
        sources: [],
        created_at: timestamp,
      };
      const assistantMessage: ChatMessage = {
        id: `assistant-${timestamp}`,
        role: "assistant",
        content: result.answer,
        sources: result.sources,
        created_at: timestamp,
      };
      setConversationId(result.conversation_id);
      setMessages((current) => [...current, userMessage, assistantMessage]);
      try {
        await refreshConversations();
      } catch {
        setErrorMessage("Message saved, but the conversation history could not be refreshed.");
      }
    } catch (error) {
      setQuestion(trimmedQuestion);
      setErrorMessage(error instanceof Error ? error.message : "Unable to send your message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setQuestion(suggestion);
    textareaRef.current?.focus();
  };

  const activeConversation = conversations.find((conversation) => conversation.id === conversationId);

  return (
    <main className="chat-workspace">
      <ConversationSidebar
        conversations={conversations}
        activeId={conversationId}
        isLoading={isLoading}
        isOpen={isSidebarOpen}
        isSending={isSending}
        onNew={startNewConversation}
        onOpen={(id) => void openConversation(id)}
        onClose={() => setIsSidebarOpen(false)}
      />

      <section className="chat-main" aria-label="Chat with your documents">
        <header className="chat-heading">
          <div className="chat-heading-title">
            <button
              type="button"
              className="chat-sidebar-toggle"
              aria-label="Open conversation history"
              aria-expanded={isSidebarOpen}
              onClick={() => setIsSidebarOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>
            <div>
              <p className="section-label">DOCUMENT ASSISTANT</p>
              <h1>{activeConversation?.title || "Your assistant"}</h1>
            </div>
          </div>
          <div className="chat-heading-actions">
            <label className="chat-document-filter">
              <span>Search in</span>
              <select
                value={selectedDocumentId}
                onChange={(event) => setSelectedDocumentId(event.target.value)}
                aria-label="Choose documents to search"
              >
                <option value="">All documents</option>
                {documents.map((document) => (
                  <option key={document.id} value={document.id}>
                    {document.original_filename}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        {errorMessage ? <p className="error-banner" role="alert">{errorMessage}</p> : null}

        <ChatTranscript
          messages={messages}
          isLoading={isLoading}
          isSending={isSending}
          endRef={endOfMessagesRef}
          onSuggestion={handleSuggestion}
        />

        <form
          ref={formRef}
          className="chat-composer"
          onSubmit={(event) => void submitQuestion(event)}
        >
          <label className="visually-hidden" htmlFor="chat-question">Your question</label>
          <textarea
            ref={textareaRef}
            id="chat-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => handleComposerKeyDown(event, () => formRef.current?.requestSubmit(), isSending)}
            placeholder="Ask a question about your documents…"
            maxLength={2000}
            rows={1}
            disabled={isSending}
          />
          <div className="chat-composer-footer">
            <span>Answers are based on your indexed documents.</span>
            <span className="chat-composer-hint">Enter to send · Shift + Enter for a new line</span>
            <button type="submit" className="chat-send-button" disabled={!question.trim() || isSending}>
              {isSending ? "Searching…" : "Send"}
              <span aria-hidden="true">↑</span>
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
