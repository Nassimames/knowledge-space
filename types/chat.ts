export interface ChatSource {
  source_id: string;
  document_id: string;
  document_name: string;
  chunk_id: string;
  page_number: number | null;
  page_end: number | null;
  similarity_score: number;
  excerpt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: ChatSource[];
  created_at: string;
}

export interface ChatRequest {
  question: string;
  conversation_id?: string;
  document_id?: string;
}

export interface ChatResponse {
  conversation_id: string;
  answer: string;
  sources: ChatSource[];
}

export interface ConversationSummary {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationPage {
  items: ConversationSummary[];
  limit: number;
  offset: number;
  total: number;
}

export interface ConversationDetail extends ConversationSummary {
  messages: ChatMessage[];
}
