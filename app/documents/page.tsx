"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { LogoutButton } from "@/app/logout-button";
import { MochiMascot } from "@/app/mochi-mascot";
import {
  DocumentGrid,
  DocumentStats,
  DocumentToolbar,
  getDocumentExtension,
  UploadDropzone,
  type DocumentSort,
  type DocumentStatusFilter,
  type DocumentTypeFilter,
} from "@/app/documents/document-library-components";
import { deleteDocument, downloadDocument, fetchDocuments, uploadDocument } from "@/lib/api";
import type { DocumentResponse } from "@/types/documents";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocumentTypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<DocumentStatusFilter>("all");
  const [sort, setSort] = useState<DocumentSort>("newest");
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isDownloadingId, setIsDownloadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [libraryLoadError, setLibraryLoadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLElement>(null);

  const loadDocuments = useCallback(async (signal?: AbortSignal) => {
    try {
      const allDocuments: DocumentResponse[] = [];
      let offset = 0;
      let total = 0;

      do {
        const page = await fetchDocuments(signal, { limit: 100, offset });
        allDocuments.push(...page.items);
        total = page.total;
        offset += page.items.length;
        if (page.items.length === 0) {
          break;
        }
      } while (allDocuments.length < total);

      setDocuments(allDocuments);
      setLibraryLoadError(null);
    } finally {
      setIsLoadingDocuments(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadDocuments(controller.signal).catch((error: unknown) => {
      if (!controller.signal.aborted) {
        setLibraryLoadError(error instanceof Error ? error.message : "Unable to load documents.");
      }
    });

    return () => controller.abort();
  }, [loadDocuments]);

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filtered = documents.filter((document) => {
      const matchesName = !normalizedQuery
        || document.original_filename.toLocaleLowerCase().includes(normalizedQuery);
      const matchesType = typeFilter === "all" || getDocumentExtension(document.original_filename) === typeFilter;
      const matchesStatus = statusFilter === "all" || document.status.toLowerCase() === statusFilter;
      return matchesName && matchesType && matchesStatus;
    });

    return filtered.sort((left, right) => {
      if (sort === "name") {
        return left.original_filename.localeCompare(right.original_filename, "en", { sensitivity: "base" });
      }
      const dateDifference = new Date(left.created_at).getTime() - new Date(right.created_at).getTime();
      return sort === "newest" ? -dateDifference : dateDifference;
    });
  }, [documents, query, sort, statusFilter, typeFilter]);

  const hasFilters = Boolean(query.trim()) || typeFilter !== "all" || statusFilter !== "all";

  const clearFilters = () => {
    setQuery("");
    setTypeFilter("all");
    setStatusFilter("all");
    setSort("newest");
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) {
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await uploadDocument(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSuccessMessage("Document uploaded and processed successfully.");
      try {
        setIsLoadingDocuments(true);
        await loadDocuments();
      } catch (error) {
        setLibraryLoadError(error instanceof Error ? error.message : "Unable to refresh the library.");
        setErrorMessage(
          `The document was uploaded, but the library could not be refreshed: ${
            error instanceof Error ? error.message : "Unknown error."
          }`,
        );
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (document: DocumentResponse) => {
    const confirmed = window.confirm(`Delete "${document.original_filename}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setIsDeletingId(document.id);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await deleteDocument(document.id);
      setSuccessMessage("Document deleted successfully.");
      try {
        setIsLoadingDocuments(true);
        await loadDocuments();
      } catch (error) {
        setLibraryLoadError(error instanceof Error ? error.message : "Unable to refresh the library.");
        setErrorMessage(
          `The document was deleted, but the library could not be refreshed: ${
            error instanceof Error ? error.message : "Unknown error."
          }`,
        );
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleDownload = async (document: DocumentResponse) => {
    setIsDownloadingId(document.id);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const blob = await downloadDocument(document.id);
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = document.original_filename;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setSuccessMessage("Document download started.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Download failed.");
    } finally {
      setIsDownloadingId(null);
    }
  };

  const handleRefresh = async () => {
    setErrorMessage(null);
    setLibraryLoadError(null);
    setSuccessMessage(null);
    setIsLoadingDocuments(true);
    try {
      await loadDocuments();
      setSuccessMessage("Library refreshed.");
    } catch (error) {
      setLibraryLoadError(error instanceof Error ? error.message : "Unable to refresh documents.");
      setErrorMessage(error instanceof Error ? error.message : "Unable to refresh documents.");
    }
  };

  const openUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    fileInputRef.current?.click();
  };

  return (
    <main className="workspace library-workspace">
      <header className="topbar">
        <Link className="wordmark" href="/" aria-label="Knowledge Space home">
          <MochiMascot />
        </Link>
        <nav className="workspace-nav" aria-label="Main navigation">
          <span aria-current="page">My documents</span>
          <Link href="/chat">Assistant</Link>
          <LogoutButton />
        </nav>
      </header>

      <section className="library-intro" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">YOUR KNOWLEDGE SPACE</p>
          <h1 id="page-title">Your knowledge, organized.</h1>
          <p className="intro-copy">
            One place for all your documents. Upload, organize and explore your knowledge.
          </p>
        </div>
        <button type="button" className="primary-button library-add-button" onClick={openUpload}>
          <span aria-hidden="true">＋</span> Add document
        </button>
      </section>

      {errorMessage ? <p className="error-banner library-notice" role="alert">{errorMessage}</p> : null}
      {successMessage ? <p className="success-banner library-notice" role="status">{successMessage}</p> : null}

      <div className="library-dashboard-grid">
        <aside className="library-overview" aria-label="Library overview and upload">
          <DocumentStats documents={documents} />

          <section className="library-upload-wrap" ref={uploadRef}>
            <UploadDropzone
              inputRef={fileInputRef}
              selectedFile={selectedFile}
              isUploading={isUploading}
              onSelect={setSelectedFile}
              onUpload={() => void handleUpload()}
              onError={(message) => setErrorMessage(message || null)}
            />
          </section>
        </aside>

        <section className="library-collection" aria-label="Document library">
          <div className="library-tools-row">
            <DocumentToolbar
              query={query}
              typeFilter={typeFilter}
              statusFilter={statusFilter}
              sort={sort}
              hasFilters={hasFilters}
              onQueryChange={setQuery}
              onTypeChange={setTypeFilter}
              onStatusChange={setStatusFilter}
              onSortChange={setSort}
              onClear={clearFilters}
            />
            <button
              type="button"
              className="ghost-button library-refresh-button"
              onClick={() => void handleRefresh()}
              disabled={isLoadingDocuments}
              aria-label={isLoadingDocuments ? "Refreshing library" : "Refresh library"}
              title={isLoadingDocuments ? "Refreshing library" : "Refresh library"}
            >
              <span className={isLoadingDocuments ? "is-refreshing" : ""} aria-hidden="true">↻</span>
            </button>
          </div>

        {libraryLoadError ? (
          <div className="library-empty-state" role="alert">
            <span className="library-empty-icon" aria-hidden="true">!</span>
            <h3>We couldn’t load your library</h3>
            <p>{libraryLoadError}</p>
            <button type="button" className="secondary-button" onClick={() => void handleRefresh()}>
              Try again
            </button>
          </div>
        ) : (
          <DocumentGrid
            documents={filteredDocuments}
            isLoading={isLoadingDocuments}
            hasFilters={hasFilters}
            isDownloadingId={isDownloadingId}
            isDeletingId={isDeletingId}
            onDownload={(document) => void handleDownload(document)}
            onDelete={(document) => void handleDelete(document)}
            onAddFirst={openUpload}
            onClearFilters={clearFilters}
          />
        )}
        </section>
      </div>

      <footer className="footer">
        <span>YOUR KNOWLEDGE, CLOSE AT HAND.</span>
        <span>{documents.length} DOCUMENT{documents.length !== 1 ? "S" : ""}</span>
      </footer>
    </main>
  );
}
