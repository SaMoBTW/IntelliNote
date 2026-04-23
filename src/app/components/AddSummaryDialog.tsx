import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchDocuments, type DocumentRow } from "@/lib/supabase/documents";
import { insertSummary } from "@/lib/supabase/summaries";
import { toast } from "sonner";

interface AddSummaryDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function AddSummaryDialog({
  open,
  onClose,
  onCreated,
}: AddSummaryDialogProps) {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [documentId, setDocumentId] = useState("");
  const [keyLines, setKeyLines] = useState("");
  const [fullSummary, setFullSummary] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    void (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const docs = await fetchDocuments(supabase);
        setDocuments(docs);
        setDocumentId((prev) => prev || docs[0]?.id || "");
      } catch {
        toast.error("Could not load documents.");
      }
    })();
  }, [open]);

  const handleSubmit = async () => {
    if (!documentId) {
      toast.error("Choose a document.");
      return;
    }
    const keyPoints = keyLines
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const body = fullSummary.trim();
    if (!body) {
      toast.error("Add summary text.");
      return;
    }
    const wordCount = body.split(/\s+/).filter(Boolean).length;
    setSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();
      await insertSummary(supabase, {
        document_id: documentId,
        key_points: keyPoints,
        full_summary: body,
        word_count: wordCount,
      });
      toast.success("Summary saved");
      setKeyLines("");
      setFullSummary("");
      onCreated();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save summary.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New summary</DialogTitle>
          <DialogDescription>
            Link a summary to one of your documents. You can paste AI output or
            your own notes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Document</Label>
            <Select value={documentId} onValueChange={setDocumentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select document" />
              </SelectTrigger>
              <SelectContent>
                {documents.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {documents.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Add a document in Library first.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Key points (one per line)</Label>
            <Textarea
              value={keyLines}
              onChange={(e) => setKeyLines(e.target.value)}
              rows={4}
              placeholder={"Main idea one\nMain idea two"}
            />
          </div>
          <div className="space-y-2">
            <Label>Full summary</Label>
            <Textarea
              value={fullSummary}
              onChange={(e) => setFullSummary(e.target.value)}
              rows={8}
              placeholder="Longer summary text…"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={saving}>
            {saving ? "Saving…" : "Save summary"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
