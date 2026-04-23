import {
  FileText,
  Clock,
  Sparkles,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Grid3x3,
  List,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { EditDialog, type EditField } from "./EditDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { format } from "date-fns";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  deleteSummary,
  fetchSummariesList,
  updateSummary,
  type SummaryListItem,
} from "@/lib/supabase/summaries";
import { AddSummaryDialog } from "./AddSummaryDialog";

interface SummaryProps {
  onSelectSummary?: (summaryId: string) => void;
}

type CardSummary = {
  id: string;
  documentTitle: string;
  dateCreated: string;
  keyPoints: string[];
  fullSummary: string;
  wordCount: number;
};

function toCard(s: SummaryListItem): CardSummary {
  const d = new Date(s.created_at);
  return {
    id: s.id,
    documentTitle: s.document_title,
    dateCreated: Number.isNaN(d.getTime())
      ? s.created_at
      : format(d, "MMM d, yyyy"),
    keyPoints: s.key_points,
    fullSummary: s.full_summary,
    wordCount: s.word_count,
  };
}

export function Summary({ onSelectSummary }: SummaryProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSummaryId, setSelectedSummaryId] = useState("");
  const [summaries, setSummaries] = useState<CardSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const rows = await fetchSummariesList(supabase);
      setSummaries(rows.map(toCard));
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not load summaries.",
      );
      setSummaries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedSummary = summaries.find((s) => s.id === selectedSummaryId);

  const handleSelectSummary = (id: string) => {
    onSelectSummary?.(id);
  };

  const handleDeleteSummary = (id: string) => {
    setSelectedSummaryId(id);
    setConfirmDialogOpen(true);
  };

  const handleEditSummary = (id: string) => {
    setSelectedSummaryId(id);
    setEditDialogOpen(true);
  };

  const confirmDeleteSummary = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      await deleteSummary(supabase, selectedSummaryId);
      setSummaries((prev) => prev.filter((s) => s.id !== selectedSummaryId));
      setSelectedSummaryId("");
      toast.success("Summary deleted");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not delete summary.",
      );
    }
  };

  const saveEditSummary = async (data: Record<string, unknown>) => {
    const kp = String(data.keyPointsText ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const full = String(data.fullSummary ?? "").trim();
    const wc = full.split(/\s+/).filter(Boolean).length;
    try {
      const supabase = getSupabaseBrowserClient();
      await updateSummary(supabase, selectedSummaryId, {
        key_points: kp,
        full_summary: full,
        word_count: wc,
      });
      setSummaries((prev) =>
        prev.map((s) =>
          s.id === selectedSummaryId
            ? { ...s, keyPoints: kp, fullSummary: full, wordCount: wc }
            : s,
        ),
      );
      toast.success("Summary updated");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not update summary.",
      );
    }
  };

  const editFields: EditField[] = [
    {
      name: "keyPointsText",
      label: "Key points (one per line)",
      type: "textarea",
      placeholder: "Point one",
      required: false,
    },
    {
      name: "fullSummary",
      label: "Full summary",
      type: "textarea",
      placeholder: "Full text…",
      required: true,
    },
  ];

  const editData = selectedSummary
    ? {
        keyPointsText: selectedSummary.keyPoints.join("\n"),
        fullSummary: selectedSummary.fullSummary,
      }
    : {};

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-4 lg:p-8 pb-20 lg:pb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1>Summaries</h1>
            </div>
            <p className="text-muted-foreground">
              Summaries linked to your documents (per-user, private).
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
            <Button onClick={() => setAddDialogOpen(true)} disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">New summary</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {summaries.map((summary, index) => (
              <motion.div
                key={summary.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className="group hover:shadow-lg transition-all cursor-pointer overflow-hidden h-full flex flex-col"
                  onClick={() => handleSelectSummary(summary.id)}
                >
                  <div className="h-32 bg-gradient-to-br from-primary/20 via-purple-500/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                    <Sparkles className="w-12 h-12 text-primary/50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    <Badge className="absolute top-3 left-3 bg-primary/10 text-primary border-primary/20">
                      Summary
                    </Badge>
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
                          onClick={() => handleEditSummary(summary.id)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDeleteSummary(summary.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start gap-2 mb-2">
                      <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <h4 className="line-clamp-2 group-hover:text-primary transition-colors">
                        {summary.documentTitle}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Clock className="w-3 h-3" />
                      <span>{summary.dateCreated}</span>
                    </div>

                    <div className="flex-1 mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Key points
                      </p>
                      <ul className="space-y-1.5">
                        {summary.keyPoints.slice(0, 3).map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            <span className="text-muted-foreground line-clamp-1 text-xs">
                              {point}
                            </span>
                          </li>
                        ))}
                        {summary.keyPoints.length > 3 && (
                          <li className="text-xs text-muted-foreground/60 ml-3">
                            +{summary.keyPoints.length - 3} more
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-border text-xs text-muted-foreground">
                      {summary.wordCount} words
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {summaries.map((summary, index) => (
              <motion.div
                key={summary.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className="group hover:shadow-md transition-all cursor-pointer p-4"
                  onClick={() => handleSelectSummary(summary.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 via-purple-500/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-8 h-8 text-primary/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                            <h4 className="group-hover:text-primary transition-colors truncate">
                              {summary.documentTitle}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{summary.dateCreated}</span>
                            <span className="mx-2">•</span>
                            <span>{summary.wordCount} words</span>
                          </div>
                        </div>
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
                              onClick={() => handleEditSummary(summary.id)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDeleteSummary(summary.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && summaries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Sparkles className="w-20 h-20 text-muted-foreground/50 mb-4" />
            <h3 className="mb-2">No summaries yet</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Create a summary linked to one of your documents.
            </p>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New summary
            </Button>
          </div>
        )}
      </div>

      <AddSummaryDialog
        open={isAddDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onCreated={() => void load()}
      />

      <ConfirmDialog
        open={isConfirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={() => void confirmDeleteSummary()}
        title="Delete summary"
        description="Are you sure? This cannot be undone."
      />

      <EditDialog
        open={isEditDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={saveEditSummary}
        title="Edit summary"
        description="Update key points and full text."
        fields={editFields}
        data={editData}
      />
    </div>
  );
}
