"use client";

import type { ChangeEvent, DragEvent, RefObject } from "react";

import type { DocumentResponse } from "@/types/documents";

export type DocumentTypeFilter = "all" | "pdf" | "docx" | "txt";
export type DocumentStatusFilter = "all" | "processed" | "processing" | "failed";
export type DocumentSort = "newest" | "oldest" | "name";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const allowedExtensions = new Set(["pdf", "docx", "txt"]);

export function getDocumentExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 1 : 2)} ${units[unitIndex]}`;
}

function formatAddedDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function getStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case "processed":
      return "Processed";
    case "processing":
      return "Processing";
    case "failed":
      return "Failed";
    case "uploaded":
      return "Uploaded";
    default:
      return status.replaceAll("_", " ");
  }
}

export function UploadDropzone({
  inputRef,
  selectedFile,
  isUploading,
  onSelect,
  onUpload,
  onError,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  selectedFile: File | null;
  isUploading: boolean;
  onSelect: (file: File | null) => void;
  onUpload: () => void;
  onError: (message: string) => void;
}) {
  const validateFile = (file: File | undefined) => {
    if (!file) {
      return;
    }

    const extension = getDocumentExtension(file.name);
    if (!allowedExtensions.has(extension)) {
      onError("Only PDF, DOCX, and TXT files are supported.");
      onSelect(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      onError("The maximum document size is 10 MiB.");
      onSelect(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    onError("");
    onSelect(file);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    validateFile(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isUploading) {
      return;
    }
    validateFile(event.dataTransfer.files[0]);
  };

  return (
    <section className="library-upload" id="document-upload-panel" aria-labelledby="upload-title">
      <div className="library-upload-copy">
        <span className="library-upload-icon" aria-hidden="true">↥</span>
        <div>
          <h2 id="upload-title">Add to your knowledge space</h2>
          <p>Drop your documents here or browse files from your device.</p>
        </div>
      </div>
      <div
        className={`upload-dropzone${selectedFile ? " has-file" : ""}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        aria-label="Drop a PDF, DOCX, or TXT document here"
      >
        <input
          ref={inputRef}
          id="document-upload"
          type="file"
          className="file-input-hidden"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={handleChange}
          disabled={isUploading}
        />
        <span className="dropzone-symbol" aria-hidden="true">＋</span>
        <div className="dropzone-content">
          <strong>{selectedFile ? selectedFile.name : "Drop your documents here"}</strong>
          <span>
            {selectedFile
              ? `${formatBytes(selectedFile.size)} · ${getDocumentExtension(selectedFile.name).toUpperCase()}`
              : "PDF, DOCX or TXT · Up to 10 MiB per file"}
          </span>
        </div>
        <label className="browse-files-button" htmlFor="document-upload">
          {selectedFile ? "Choose another" : "Browse files"}
        </label>
      </div>
      {selectedFile ? (
        <div className="upload-selection-actions">
          <span><span className="status-dot ready" />Ready to upload</span>
          <button type="button" className="primary-button" onClick={onUpload} disabled={isUploading}>
            {isUploading ? "Uploading…" : "Upload document"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

export function DocumentStats({ documents }: { documents: DocumentResponse[] }) {
  const stats = [
    { label: "Total documents", value: documents.length, icon: "▤", tone: "neutral" },
    { label: "Processed", value: documents.filter((document) => document.status.toLowerCase() === "processed").length, icon: "✓", tone: "green" },
    { label: "Processing", value: documents.filter((document) => document.status.toLowerCase() === "processing").length, icon: "◷", tone: "sage" },
    { label: "With errors", value: documents.filter((document) => document.status.toLowerCase() === "failed").length, icon: "!", tone: "terracotta" },
  ];

  return (
    <section className="document-stats" aria-label="Document statistics">
      {stats.map((stat) => (
        <div className="document-stat" key={stat.label}>
          <span className={`document-stat-icon ${stat.tone}`} aria-hidden="true">{stat.icon}</span>
          <span className="document-stat-copy">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </span>
        </div>
      ))}
    </section>
  );
}

export function DocumentToolbar({
  query,
  typeFilter,
  statusFilter,
  sort,
  hasFilters,
  onQueryChange,
  onTypeChange,
  onStatusChange,
  onSortChange,
  onClear,
}: {
  query: string;
  typeFilter: DocumentTypeFilter;
  statusFilter: DocumentStatusFilter;
  sort: DocumentSort;
  hasFilters: boolean;
  onQueryChange: (value: string) => void;
  onTypeChange: (value: DocumentTypeFilter) => void;
  onStatusChange: (value: DocumentStatusFilter) => void;
  onSortChange: (value: DocumentSort) => void;
  onClear: () => void;
}) {
  return (
    <div className="document-toolbar">
      <label className="document-search">
        <span aria-hidden="true">⌕</span>
        <span className="visually-hidden">Search documents</span>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search your library"
        />
        {query ? (
          <button type="button" onClick={() => onQueryChange("")} aria-label="Clear search">×</button>
        ) : null}
      </label>

      <label className="document-filter">
        <span className="visually-hidden">Filter by file type</span>
        <select value={typeFilter} onChange={(event) => onTypeChange(event.target.value as DocumentTypeFilter)}>
          <option value="all">All types</option>
          <option value="pdf">PDF</option>
          <option value="docx">DOCX</option>
          <option value="txt">TXT</option>
        </select>
      </label>

      <label className="document-filter">
        <span className="visually-hidden">Filter by processing status</span>
        <select value={statusFilter} onChange={(event) => onStatusChange(event.target.value as DocumentStatusFilter)}>
          <option value="all">All statuses</option>
          <option value="processed">Processed</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
        </select>
      </label>

      <label className="document-filter document-sort">
        <span className="visually-hidden">Sort documents</span>
        <select value={sort} onChange={(event) => onSortChange(event.target.value as DocumentSort)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name</option>
        </select>
      </label>

      {hasFilters ? <button type="button" className="clear-filters-button" onClick={onClear}>Clear filters</button> : null}
    </div>
  );
}

function DocumentCard({
  document,
  isDownloading,
  isDeleting,
  onDownload,
  onDelete,
}: {
  document: DocumentResponse;
  isDownloading: boolean;
  isDeleting: boolean;
  onDownload: (document: DocumentResponse) => void;
  onDelete: (document: DocumentResponse) => void;
}) {
  const extension = getDocumentExtension(document.original_filename);
  const status = document.status.toLowerCase();

  return (
    <li className="library-document-card">
      <div className={`library-file-icon ${extension}`} aria-hidden="true">
        <span>{extension || "FILE"}</span>
        <strong>▤</strong>
      </div>
      <details className="document-actions-menu">
        <summary aria-label={`Actions for ${document.original_filename}`} title="Document actions">···</summary>
        <div className="document-actions-popover">
          <button type="button" onClick={() => onDownload(document)} disabled={isDownloading}>
            <span aria-hidden="true">↓</span>{isDownloading ? "Downloading…" : "Download"}
          </button>
          <button type="button" className="delete-action" onClick={() => onDelete(document)} disabled={isDeleting}>
            <span aria-hidden="true">⌫</span>{isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </details>

      <h3 title={document.original_filename}>{document.original_filename}</h3>
      <div className="library-card-meta">
        <span>{extension.toUpperCase()} file</span>
        <span>{formatBytes(document.file_size_bytes)}</span>
      </div>
      <div className="library-card-footer">
        <time dateTime={document.created_at}>{formatAddedDate(document.created_at)}</time>
        <span className={`document-status-badge ${status}`} title={`Status: ${getStatusLabel(status)}`}>
          <span aria-hidden="true" />
          {getStatusLabel(status)}
        </span>
      </div>
    </li>
  );
}

function DocumentSkeletons() {
  return (
    <ul className="library-document-grid" aria-label="Loading documents">
      {Array.from({ length: 6 }, (_, index) => (
        <li className="document-skeleton" key={index} aria-hidden="true">
          <span />
          <div><i /><i /><i /></div>
          <i />
        </li>
      ))}
    </ul>
  );
}

export function DocumentGrid({
  documents,
  isLoading,
  hasFilters,
  isDownloadingId,
  isDeletingId,
  onDownload,
  onDelete,
  onAddFirst,
  onClearFilters,
}: {
  documents: DocumentResponse[];
  isLoading: boolean;
  hasFilters: boolean;
  isDownloadingId: string | null;
  isDeletingId: string | null;
  onDownload: (document: DocumentResponse) => void;
  onDelete: (document: DocumentResponse) => void;
  onAddFirst: () => void;
  onClearFilters: () => void;
}) {
  if (isLoading) {
    return <DocumentSkeletons />;
  }

  if (documents.length === 0 && hasFilters) {
    return (
      <div className="library-empty-state">
        <span className="library-empty-icon" aria-hidden="true">⌕</span>
        <h3>No matching documents</h3>
        <p>Try a different search or clear your filters.</p>
        <button type="button" className="secondary-button" onClick={onClearFilters}>Clear filters</button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="library-empty-state">
        <span className="library-empty-icon" aria-hidden="true">▤</span>
        <h3>Your library starts here</h3>
        <p>Add your first document to begin building your knowledge space.</p>
        <button type="button" className="primary-button" onClick={onAddFirst}>Add your first document</button>
      </div>
    );
  }

  return (
    <ul className="library-document-grid" aria-live="polite">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          isDownloading={isDownloadingId === document.id}
          isDeleting={isDeletingId === document.id}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
