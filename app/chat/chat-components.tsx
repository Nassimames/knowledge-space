"use client";

import type { KeyboardEvent, RefObject } from "react";
import Link from "next/link";

import { LogoutButton } from "@/app/logout-button";
import { MochiMascot } from "@/app/mochi-mascot";
import type { ChatMessage, ChatSource, ConversationSummary } from "@/types/chat";

const suggestedQuestions = [
  "Summarize the main ideas in my documents.",
  "What are the most important topics?",
  "Compare information across my documents.",
  "Find the key dates and figures.",
];

function formatConversationDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(date);
}

function formatSourcePages(source: ChatSource): string | null {
  if (source.page_number === null) {
    return null;
  }
  if (source.page_end !== null && source.page_end !== source.page_number) {
    return `pages ${source.page_number}–${source.page_end}`;
  }
  return `page ${source.page_number}`;
}

function renderInline(text: string, keyPrefix: string) {
  const tokenPattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(tokenPattern);

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={key}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function AssistantContent({ content }: { content: string }) {
  const blocks = content.trim().split(/\n\s*\n/);

  return (
    <div className="assistant-content">
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
        if (lines.length === 0) {
          return null;
        }

        const heading = lines[0].match(/^(#{1,3})\s+(.+)$/);
        if (heading && lines.length === 1) {
          const Heading = heading[1].length === 1 ? "h3" : "h4";
          return <Heading key={`block-${blockIndex}`}>{renderInline(heading[2], `h-${blockIndex}`)}</Heading>;
        }

        const isUnorderedList = lines.every((line) => /^[-*]\s+/.test(line));
        if (isUnorderedList) {
          return (
            <ul key={`block-${blockIndex}`}>
              {lines.map((line, lineIndex) => (
                <li key={`list-${blockIndex}-${lineIndex}`}>
                  {renderInline(line.replace(/^[-*]\s+/, ""), `li-${blockIndex}-${lineIndex}`)}
                </li>
              ))}
            </ul>
          );
        }

        const isOrderedList = lines.every((line) => /^\d+[.)]\s+/.test(line));
        if (isOrderedList) {
          return (
            <ol key={`block-${blockIndex}`}>
              {lines.map((line, lineIndex) => (
                <li key={`ordered-${blockIndex}-${lineIndex}`}>
                  {renderInline(line.replace(/^\d+[.)]\s+/, ""), `ol-${blockIndex}-${lineIndex}`)}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`block-${blockIndex}`}>
            {lines.map((line, lineIndex) => (
              <span key={`line-${blockIndex}-${lineIndex}`}>
                {lineIndex > 0 ? <br /> : null}
                {renderInline(line, `p-${blockIndex}-${lineIndex}`)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export function ConversationSidebar({
  conversations,
  activeId,
  isLoading,
  isOpen,
  isSending,
  onNew,
  onOpen,
  onClose,
}: {
  conversations: ConversationSummary[];
  activeId: string | null;
  isLoading: boolean;
  isOpen: boolean;
  isSending: boolean;
  onNew: () => void;
  onOpen: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <button
        type="button"
        className={`chat-sidebar-backdrop${isOpen ? " visible" : ""}`}
        aria-label="Close conversation history"
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
      />
      <aside className={`chat-sidebar${isOpen ? " open" : ""}`} aria-label="Conversation history">
        <div className="chat-sidebar-top">
          <Link className="chat-brand" href="/" aria-label="Knowledge Space home">
            <MochiMascot />
          </Link>
          <button type="button" className="chat-sidebar-close" onClick={onClose} aria-label="Close menu">
            ×
          </button>
        </div>

        <nav className="chat-workspace-nav" aria-label="Main navigation">
          <Link href="/documents">
            <span aria-hidden="true">▤</span>
            Document library
          </Link>
          <Link href="/chat" aria-current="page">
            <span aria-hidden="true"><MochiMascot size="favicon" /></span>
            Assistant
          </Link>
        </nav>

        <button type="button" className="new-chat-button" onClick={onNew} disabled={isSending}>
          <span aria-hidden="true">＋</span>
          New conversation
        </button>

        <div className="conversation-section-heading">
          <span>RECENT</span>
          {conversations.length > 0 ? <span>{conversations.length}</span> : null}
        </div>

        {isLoading && conversations.length === 0 ? (
          <div className="conversation-loading" role="status">Loading conversations…</div>
        ) : conversations.length === 0 ? (
          <div className="conversation-empty">
            <span aria-hidden="true">↗</span>
            <p>No conversations yet.</p>
            <span>Start by asking a question about your documents.</span>
          </div>
        ) : (
          <ul className="conversation-list">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <button
                  type="button"
                  className={`conversation-link${conversation.id === activeId ? " active" : ""}`}
                  onClick={() => onOpen(conversation.id)}
                  disabled={isSending}
                  aria-current={conversation.id === activeId ? "page" : undefined}
                  title={conversation.title || "New conversation"}
                >
                  <span className="conversation-link-title">
                    <span className="conversation-dot" aria-hidden="true" />
                    <strong>{conversation.title || "New conversation"}</strong>
                  </span>
                  <time dateTime={conversation.updated_at}>{formatConversationDate(conversation.updated_at)}</time>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="chat-sidebar-footer">
          <span>Your private knowledge space</span>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}

export function SourceList({ sources }: { sources: ChatSource[] }) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <details className="chat-sources">
      <summary>
        <span className="source-summary-icon" aria-hidden="true">↗</span>
        Sources <span className="source-count">{sources.length}</span>
      </summary>
      <ul>
        {sources.map((source) => (
          <li key={source.source_id}>
            <div className="chat-source-heading">
              <span className="source-badge">[{source.source_id}]</span>
              <strong title={source.document_name}>{source.document_name}</strong>
              {formatSourcePages(source) ? <span>{formatSourcePages(source)}</span> : null}
            </div>
            <p>{source.excerpt}</p>
          </li>
        ))}
      </ul>
    </details>
  );
}

export function ChatTranscript({
  messages,
  isLoading,
  isSending,
  endRef,
  onSuggestion,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  endRef: RefObject<HTMLDivElement | null>;
  onSuggestion: (question: string) => void;
}) {
  return (
    <div className="chat-transcript" aria-live="polite">
      {isLoading && messages.length === 0 ? (
        <div className="chat-welcome"><p>Ouverture de la conversation…</p></div>
      ) : messages.length === 0 ? (
        <div className="chat-welcome">
          <span className="chat-welcome-mark"><MochiMascot size="welcome" /></span>
          <p className="chat-welcome-title">What would you like to explore?</p>
          <span className="chat-welcome-copy">
            Ask a question and get answers grounded in passages from your documents.
          </span>
          <div className="chat-suggestions" aria-label="Suggested questions">
            {suggestedQuestions.map((suggestion) => (
              <button
                type="button"
                key={suggestion}
                onClick={() => onSuggestion(suggestion)}
                disabled={isSending}
              >
                <span aria-hidden="true">↗</span>
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <article className={`chat-message ${message.role}`} key={message.id}>
            <span className="chat-avatar" aria-hidden="true">
              {message.role === "user" ? "V" : <MochiMascot size="favicon" />}
            </span>
            <div className="chat-message-body">
              <span className="chat-message-label">
                {message.role === "user" ? "VOUS" : "ASSISTANT"}
              </span>
              {message.role === "assistant" ? (
                <AssistantContent content={message.content} />
              ) : (
                <p>{message.content}</p>
              )}
              {message.role === "assistant" ? <SourceList sources={message.sources ?? []} /> : null}
            </div>
          </article>
        ))
      )}
      {isSending ? (
        <article className="chat-message assistant chat-generating" role="status">
          <span className="chat-avatar" aria-hidden="true"><MochiMascot size="favicon" /></span>
          <div className="chat-message-body">
            <span className="chat-message-label">ASSISTANT</span>
            <p className="chat-thinking"><span className="typing-indicator" />Searching your documents…</p>
          </div>
        </article>
      ) : null}
      <div ref={endRef} />
    </div>
  );
}

export function handleComposerKeyDown(
  event: KeyboardEvent<HTMLTextAreaElement>,
  submit: () => void,
  isSending: boolean,
) {
  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && !isSending) {
    event.preventDefault();
    submit();
  }
}
