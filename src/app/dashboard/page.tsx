"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ExportButtons } from "@/components/export-buttons";
import { Modal } from "@/components/ui/modal";
import {
  Search,
  Trash2,
  FileText,
  PenTool,
  ClipboardList,
  MessageCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Paintbrush,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface DocumentItem {
  id: string;
  title: string;
  tool: string;
  docType: string | null;
  preview: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentFull {
  id: string;
  title: string;
  content: string;
  tool: string;
  docType: string | null;
  createdAt: string;
  updatedAt: string;
}

const TOOL_ICONS: Record<string, React.ReactNode> = {
  builder: <PenTool className="h-4 w-4" />,
  formatter: <FileText className="h-4 w-4" />,
  summarizer: <ClipboardList className="h-4 w-4" />,
  assistant: <MessageCircle className="h-4 w-4" />,
};

const TOOL_LABELS: Record<string, string> = {
  builder: "Builder",
  formatter: "Formatter",
  summarizer: "Summarizer",
  assistant: "Assistant",
};

const TOOL_COLORS: Record<string, string> = {
  builder: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  formatter:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  summarizer:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  assistant:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

/* ------------------------------------------------------------------ */
/*  Dashboard Page                                                     */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toolFilter, setToolFilter] = useState<string | null>(null);

  // View mode
  const [selectedDoc, setSelectedDoc] = useState<DocumentFull | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<DocumentItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ── Fetch documents ── */
  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (toolFilter) params.set("tool", toolFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/documents?${params}`);
      if (!res.ok) throw new Error("Failed to load documents");

      const data = await res.json();
      setDocuments(data.documents);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, [page, toolFilter, search]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  /* ── View a document ── */
  const handleView = useCallback(async (id: string) => {
    setLoadingDoc(true);
    try {
      const res = await fetch(`/api/documents/${id}`);
      if (!res.ok) throw new Error("Failed to load document");
      const data = await res.json();
      setSelectedDoc(data.document);
    } catch {
      toast.error("Failed to load document.");
    } finally {
      setLoadingDoc(false);
    }
  }, []);

  /* ── Delete a document ── */
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/documents/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Document deleted.");
      setDeleteTarget(null);
      // If we were viewing this doc, go back to list
      if (selectedDoc?.id === deleteTarget.id) setSelectedDoc(null);
      fetchDocs();
    } catch {
      toast.error("Failed to delete document.");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, selectedDoc, fetchDocs]);

  /* ── Route to Formatter ── */
  const handleRouteToFormatter = (text: string) => {
    localStorage.setItem("puredraft_formatter_payload", text);
    router.push("/formatter");
  };

  /* ── Document detail view ── */
  if (selectedDoc) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDoc(null)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1 min-w-0">
                <CardTitle className="text-lg sm:text-xl break-words">
                  {selectedDoc.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${TOOL_COLORS[selectedDoc.tool] || ""}`}
                  >
                    {TOOL_ICONS[selectedDoc.tool]}
                    {TOOL_LABELS[selectedDoc.tool] || selectedDoc.tool}
                  </span>
                  {selectedDoc.docType && (
                    <span className="text-xs">
                      &middot; {selectedDoc.docType}
                    </span>
                  )}
                  <span className="text-xs">
                    &middot;{" "}
                    {new Date(selectedDoc.createdAt).toLocaleDateString()}
                  </span>
                </CardDescription>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  setDeleteTarget({
                    id: selectedDoc.id,
                    title: selectedDoc.title,
                    tool: selectedDoc.tool,
                    docType: selectedDoc.docType,
                    preview: "",
                    createdAt: selectedDoc.createdAt,
                    updatedAt: selectedDoc.updatedAt,
                  })
                }
                className="gap-2 shrink-0"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer content={selectedDoc.content} />

            <div className="mt-4 flex flex-wrap items-center gap-2 pt-2">
              <ExportButtons
                content={selectedDoc.content}
                filename={selectedDoc.title}
              />
              <Button
                variant="secondary"
                onClick={() => handleRouteToFormatter(selectedDoc.content)}
                className="gap-2"
              >
                <Paintbrush className="h-4 w-4" />
                Format Document
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Delete Document?"
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="gap-2"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </>
          }
        >
          <p className="text-sm text-muted-foreground">
            This will permanently delete &ldquo;{deleteTarget?.title}&rdquo;.
            This action cannot be undone.
          </p>
        </Modal>
      </div>
    );
  }

  /* ── Document list view ── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          My Documents
        </h1>
        <p className="mt-1 text-muted-foreground">
          View and manage your saved HR documents.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          <Button
            variant={toolFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setToolFilter(null);
              setPage(1);
            }}
            className="shrink-0"
          >
            All
          </Button>
          {Object.entries(TOOL_LABELS).map(([key, label]) => (
            <Button
              key={key}
              variant={toolFilter === key ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setToolFilter(key);
                setPage(1);
              }}
              className="gap-1.5 shrink-0"
            >
              {TOOL_ICONS[key]}
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="font-medium text-lg">No documents yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Generate a document and click &ldquo;Save&rdquo; to see it here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleView(doc.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2 break-words">
                      {doc.title}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(doc);
                      }}
                      aria-label={`Delete ${doc.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${TOOL_COLORS[doc.tool] || ""}`}
                    >
                      {TOOL_ICONS[doc.tool]}
                      {TOOL_LABELS[doc.tool] || doc.tool}
                    </span>
                    {doc.docType && (
                      <span className="text-xs text-muted-foreground">
                        {doc.docType}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {doc.preview.replace(/[#*_|]/g, "")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({total} docs)
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Document?"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          This will permanently delete &ldquo;{deleteTarget?.title}&rdquo;. This
          action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
