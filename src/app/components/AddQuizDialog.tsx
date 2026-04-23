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
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchDocuments, type DocumentRow } from "@/lib/supabase/documents";
import { insertQuiz, insertQuizQuestion } from "@/lib/supabase/quizzes";
import { toast } from "sonner";

interface AddQuizDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function AddQuizDialog({
  open,
  onClose,
  onCreated,
}: AddQuizDialogProps) {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [title, setTitle] = useState("");
  const [documentId, setDocumentId] = useState<string>("__none__");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    void (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const docs = await fetchDocuments(supabase);
        setDocuments(docs);
      } catch {
        toast.error("Could not load documents.");
      }
    })();
  }, [open]);

  const handleSubmit = async () => {
    const t = title.trim();
    if (!t) {
      toast.error("Enter a quiz title.");
      return;
    }
    setSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const doc =
        documentId && documentId !== "__none__" ? documentId : null;
      const quiz = await insertQuiz(supabase, {
        title: t,
        document_id: doc,
      });
      await insertQuizQuestion(supabase, {
        quiz_id: quiz.id,
        question: "Sample question — edit or add more in a future release.",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct_index: 0,
        explanation: "Replace this with your own questions when editing is available.",
        sort_order: 0,
      });
      toast.success("Quiz created with one sample question.");
      setTitle("");
      setDocumentId("__none__");
      onCreated();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create quiz.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New quiz</DialogTitle>
          <DialogDescription>
            Creates a quiz with one sample question you can take immediately.
            Full question editing will come later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="quiz-title">Title</Label>
            <Input
              id="quiz-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 5 check"
            />
          </div>
          <div className="space-y-2">
            <Label>Link to document (optional)</Label>
            <Select value={documentId} onValueChange={setDocumentId}>
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {documents.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={saving}>
            {saving ? "Creating…" : "Create quiz"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
