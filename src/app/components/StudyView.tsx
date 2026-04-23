import { useState, useEffect, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  Search,
  Highlighter,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  fetchDocumentById,
  touchDocumentOpened,
  type DocumentRow,
} from "@/lib/supabase/documents";

interface StudyViewProps {
  documentId: string;
  onBack: () => void;
  onGenerateQuiz: () => void;
}

export function StudyView({
  documentId,
  onBack,
  onGenerateQuiz,
}: StudyViewProps) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [doc, setDoc] = useState<DocumentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryRow, setSummaryRow] = useState<{
    key_points: string[];
    full_summary: string;
  } | null>(null);

  const [chatMessages] = useState<
    { role: "assistant" | "user"; content: string }[]
  >([
    {
      role: "assistant",
      content:
        "Chat with your notes will be available when we connect an AI backend. For now, use your saved summary on the Summary tab.",
    },
  ]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const row = await fetchDocumentById(supabase, documentId);
      setDoc(row);
      if (row) {
        await touchDocumentOpened(supabase, documentId);
        const refreshed = await fetchDocumentById(supabase, documentId);
        if (refreshed) setDoc(refreshed);
      }

      const { data: sum } = await supabase
        .from("summaries")
        .select("key_points, full_summary")
        .eq("document_id", documentId)
        .maybeSingle();

      if (sum) {
        const kp = sum.key_points;
        setSummaryRow({
          key_points: Array.isArray(kp) ? (kp as string[]) : [],
          full_summary: sum.full_summary ?? "",
        });
      } else {
        setSummaryRow(null);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load document.";
      toast.error(msg);
      setDoc(null);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const subtitle = doc
    ? `${doc.type} · ${doc.progress ?? 0}% progress${
        doc.last_opened_at
          ? ` · Opened ${formatDistanceToNow(new Date(doc.last_opened_at), { addSuffix: true })}`
          : ""
      }`
    : "";

  const renderDocumentBody = () => {
    if (loading) {
      return (
        <div className="space-y-4 p-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      );
    }
    if (!doc) {
      return (
        <p className="text-muted-foreground text-sm p-6">
          Document not found or you don&apos;t have access.
        </p>
      );
    }
    if (!doc.body_text?.trim()) {
      return (
        <div className="p-6 lg:p-8 text-center text-muted-foreground text-sm space-y-2">
          <p>No note text saved for this item yet.</p>
          <p>
            Add text when you create a document (paste mode), or edit the row
            in Supabase / a future editor.
          </p>
        </div>
      );
    }
    return (
      <div className="prose prose-slate dark:prose-invert max-w-none prose-sm lg:prose-base">
        <div className="whitespace-pre-wrap">{doc.body_text}</div>
      </div>
    );
  };

  const renderSummaryTab = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-secondary" />
        <h4>Summary</h4>
      </div>
      {!summaryRow?.full_summary?.trim() &&
      !(summaryRow?.key_points && summaryRow.key_points.length > 0) ? (
        <p className="text-sm text-muted-foreground">
          No summary linked to this document. Create one from the{" "}
          <strong>Summaries</strong> section.
        </p>
      ) : (
        <>
          {summaryRow.key_points && summaryRow.key_points.length > 0 && (
            <Card className="p-4">
              <h4 className="mb-3">Key points</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {summaryRow.key_points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </Card>
          )}
          {summaryRow.full_summary?.trim() ? (
            <Card className="p-4">
              <h4 className="mb-2">Full summary</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {summaryRow.full_summary}
              </p>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="min-w-0">
            <h3 className="truncate">{doc?.title ?? "Loading…"}</h3>
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          </div>
        </div>
        <Button onClick={onGenerateQuiz} className="gap-2 shrink-0">
          <Sparkles className="w-4 h-4" />
          Flashcards / quizzes
        </Button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-border bg-muted/30">
          <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-2 lg:gap-4 overflow-x-auto">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm min-w-12 lg:min-w-16 text-center">
                {zoomLevel}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search in page (coming soon)…" className="pl-10" />
              </div>
            </div>
            <Button variant="ghost" size="sm" type="button">
              <Highlighter className="w-4 h-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 lg:p-8 max-w-3xl mx-auto">
              <Card className="p-4 lg:p-8 shadow-lg">{renderDocumentBody()}</Card>
            </div>
          </ScrollArea>
        </div>

        <div className="hidden lg:flex w-2/5 flex-col bg-card">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4 m-4 mb-0">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
              <TabsTrigger value="flashcards">Cards</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col mt-0 p-4">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl p-4 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-secondary" />
                            <span className="text-xs text-muted-foreground">
                              AI Assistant
                            </span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-4 flex gap-2">
                <Input placeholder="Coming soon…" className="flex-1" disabled />
                <Button disabled>Send</Button>
              </div>
            </TabsContent>

            <TabsContent
              value="summary"
              className="flex-1 mt-0 p-4 overflow-auto"
            >
              {renderSummaryTab()}
            </TabsContent>

            <TabsContent value="quiz" className="flex-1 mt-0 p-4">
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Sparkles className="w-12 h-12 text-secondary mb-4" />
                <h4 className="mb-2">Practice quizzes</h4>
                <p className="text-sm text-muted-foreground mb-6">
                  Build quizzes in the Quizzes section, or use the button above to jump there.
                </p>
                <Button onClick={onGenerateQuiz}>Open flashcards</Button>
              </div>
            </TabsContent>

            <TabsContent value="flashcards" className="flex-1 mt-0 p-4">
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Sparkles className="w-12 h-12 text-secondary mb-4" />
                <h4 className="mb-2">Flashcard decks</h4>
                <p className="text-sm text-muted-foreground mb-6">
                  Create decks in the Flashcards section and study them there.
                </p>
                <Button onClick={onGenerateQuiz}>Go to flashcards</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-20 right-4 z-50">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-2xl bg-gradient-to-br from-primary to-secondary"
          onClick={() => setShowAIPanel(!showAIPanel)}
        >
          <Sparkles className="w-6 h-6" />
        </Button>
      </div>

      {showAIPanel && (
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          className="lg:hidden fixed inset-0 bg-card z-40 flex flex-col"
        >
          <div className="border-b border-border p-4 flex items-center justify-between">
            <h3>Assistant</h3>
            <Button variant="ghost" onClick={() => setShowAIPanel(false)}>
              Close
            </Button>
          </div>

          <Tabs defaultValue="summary" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="flex-1 mt-0 p-4 overflow-auto">
              {renderSummaryTab()}
            </TabsContent>
            <TabsContent value="chat" className="flex-1 mt-0 p-4">
              <p className="text-sm text-muted-foreground">{chatMessages[0].content}</p>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </div>
  );
}
