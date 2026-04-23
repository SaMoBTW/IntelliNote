import {
  FileText,
  Clock,
  MoreVertical,
  Grid3x3,
  List,
  FolderOpen,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { AddContentDialog } from "./AddContentDialog";
import { LibrarySkeleton } from "./Skeleton";
import { ConfirmDialog } from "./ConfirmDialog";
import { EditDialog, EditField } from "./EditDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  deleteDocument,
  fetchDocuments,
  insertDocument,
  updateDocument,
  type DocumentRow,
} from "@/lib/supabase/documents";
import { useAuth } from "../auth/AuthContext";

interface LibraryProps {
  onSelectDocument: (documentId: string) => void;
}

interface Document {
  id: string;
  title: string;
  type: string;
  dateAdded: string;
  processed: boolean;
  thumbnail?: string;
}

function rowToDocument(row: DocumentRow): Document {
  const d = new Date(row.created_at);
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    dateAdded: Number.isNaN(d.getTime())
      ? row.created_at
      : format(d, "MMM d, yyyy"),
    processed: row.processed,
  };
}

export function Library({ onSelectDocument }: LibraryProps) {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [listLoading, setListLoading] = useState(true);

  const loadDocuments = useCallback(async () => {
    if (!user) return;
    setListLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const rows = await fetchDocuments(supabase);
      setDocuments(rows.map(rowToDocument));
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not load documents.";
      toast.error(message, {
        description:
          "Apply the SQL migration in supabase/migrations if you have not created the documents table yet.",
      });
      setDocuments([]);
    } finally {
      setListLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const selectedDocument = documents.find((doc) => doc.id === selectedDocumentId);

  const handleDeleteDocument = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      await deleteDocument(supabase, selectedDocumentId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== selectedDocumentId));
      setSelectedDocumentId("");
      toast.success("Document removed");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not delete document.";
      toast.error(message);
    }
  };

  const handleEditDocument = async (data: { title: string; type: string }) => {
    try {
      const supabase = getSupabaseBrowserClient();
      await updateDocument(supabase, selectedDocumentId, {
        title: data.title,
        type: data.type,
      });
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === selectedDocumentId
            ? { ...doc, title: data.title, type: data.type }
            : doc,
        ),
      );
      setEditDialogOpen(false);
      toast.success("Document updated");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not update document.";
      toast.error(message);
    }
  };

  const handleLibraryAdd = async (input: {
    title: string;
    type: string;
    body_text?: string | null;
  }) => {
    try {
      const supabase = getSupabaseBrowserClient();
      const row = await insertDocument(supabase, {
        title: input.title,
        type: input.type,
        processed: false,
        body_text: input.body_text ?? null,
      });
      setDocuments((prev) => [rowToDocument(row), ...prev]);
      toast.success("Document added to your library");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not add document.";
      toast.error(message);
      throw e;
    }
  };

  const editFields: EditField[] = [
    {
      name: "title",
      label: "Document Title",
      type: "text",
      placeholder: "Enter document title",
      required: true,
    },
    {
      name: "type",
      label: "Document Type",
      type: "text",
      placeholder: "PDF, DOCX, etc.",
      required: true,
    },
  ];

  const mainContent = listLoading ? (
    <LibrarySkeleton />
  ) : documents.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-20">
      <FolderOpen className="w-20 h-20 text-muted-foreground/50 mb-4" />
      <h3 className="mb-2">No documents yet</h3>
      <p className="text-muted-foreground mb-6">
        Upload your first document to get started
      </p>
      <Button onClick={() => setAddDialogOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Upload Document
      </Button>
    </div>
  ) : viewMode === "grid" ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {documents.map((doc, index) => (
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card
            className="group hover:shadow-lg transition-all cursor-pointer overflow-hidden"
            onClick={() => onSelectDocument(doc.id)}
          >
            <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
              <FileText className="w-16 h-16 text-primary/50" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              {doc.processed && (
                <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground">
                  Processed
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedDocumentId(doc.id);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      setSelectedDocumentId(doc.id);
                      setConfirmDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="p-4">
              <h4 className="mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                {doc.title}
              </h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{doc.dateAdded}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  ) : (
    <div className="space-y-3">
      {documents.map((doc, index) => (
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card
            className="group hover:shadow-md transition-all cursor-pointer p-4"
            onClick={() => onSelectDocument(doc.id)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary/50" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="mb-1 group-hover:text-primary transition-colors truncate">
                  {doc.title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{doc.dateAdded}</span>
                </div>
              </div>
              {doc.processed && (
                <Badge className="bg-secondary text-secondary-foreground flex-shrink-0">
                  Processed
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedDocumentId(doc.id);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      setSelectedDocumentId(doc.id);
                      setConfirmDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-4 lg:p-8 pb-20 lg:pb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2">My Library</h1>
            <p className="text-muted-foreground">
              All your documents in one place
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
            <Button
              onClick={() => setAddDialogOpen(true)}
              disabled={listLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add Document</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {mainContent}
      </div>

      <AddContentDialog
        open={isAddDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        mode="library"
        onLibraryAdd={handleLibraryAdd}
      />

      <ConfirmDialog
        open={isConfirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
        onConfirm={() => void handleDeleteDocument()}
      />

      <EditDialog
        open={isEditDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        title="Edit Document"
        description="Update the details of this document."
        fields={editFields}
        data={selectedDocument}
        onSubmit={(data) => void handleEditDocument(data)}
      />
    </div>
  );
}
