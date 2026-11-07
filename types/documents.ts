export interface DocumentResponse {
  id: string;
  original_filename: string;
  content_type: string;
  file_size_bytes: number;
  checksum_sha256: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentPage {
  items: DocumentResponse[];
  limit: number;
  offset: number;
  total: number;
}
