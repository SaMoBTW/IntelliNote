import {
  Brain,
  Clock,
  Play,
  Plus,
  MoreVertical,
  Grid3x3,
  List,
  Trash2,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
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
  deleteDeck,
  fetchDecksList,
  insertDeck,
  type DeckListItem,
} from "@/lib/supabase/flashcards";
import { fetchDocuments, type DocumentRow } from "@/lib/supabase/documents";

interface FlashcardLibraryProps {
  onSelectDeck: (deckId: string) => void;
}

export function FlashcardLibrary({ onSelectDeck }: FlashcardLibraryProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [decks, setDecks] = useState<DeckListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDocId, setNewDocId] = useState("__none__");
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const list = await fetchDecksList(supabase);
      setDecks(list);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not load flashcard decks.",
      );
      setDecks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!createOpen) return;
    void (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const docs = await fetchDocuments(supabase);
        setDocuments(docs);
      } catch {
        toast.error("Could not load documents.");
      }
    })();
  }, [createOpen]);

  const totalCards = decks.reduce((s, d) => s + d.cards_count, 0);

  const confirmDeleteDeck = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      await deleteDeck(supabase, selectedDeckId);
      setDecks((prev) => prev.filter((d) => d.id !== selectedDeckId));
      toast.success("Deck deleted");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not delete deck.",
      );
    }
    setSelectedDeckId("");
  };

  const handleCreateDeck = async () => {
    const t = newTitle.trim();
    if (!t) {
      toast.error("Enter a deck title.");
      return;
    }
    setSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const doc =
        newDocId && newDocId !== "__none__" ? newDocId : null;
      await insertDeck(supabase, { title: t, document_id: doc });
      toast.success("Deck created — open it and add cards.");
      setNewTitle("");
      setNewDocId("__none__");
      setCreateOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create deck.");
    } finally {
      setSaving(false);
    }
  };

  const deckSubtitle = (d: DeckListItem) =>
    d.document_title ? `From: ${d.document_title}` : "Standalone deck";

  const deckDate = (d: DeckListItem) => {
    const dt = new Date(d.created_at);
    return Number.isNaN(dt.getTime())
      ? d.created_at
      : format(dt, "MMM d, yyyy");
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-4 lg:p-8 pb-20 lg:pb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-6 h-6 text-primary" />
              <h1>Flashcard decks</h1>
            </div>
            <p className="text-muted-foreground">
              Your decks and cards (per-user, private).
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
            <Button onClick={() => setCreateOpen(true)} disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Create deck</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="text-2xl font-bold mb-1">{decks.length}</div>
            <div className="text-sm text-muted-foreground">Decks</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
            <div className="text-2xl font-bold mb-1">{totalCards}</div>
            <div className="text-sm text-muted-foreground">Cards</div>
          </Card>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {decks.map((deck, index) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="group hover:shadow-lg transition-all overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                    <Brain className="w-12 h-12 text-primary/50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    <Badge className="absolute top-3 left-3 bg-muted text-muted-foreground">
                      {deck.cards_count} cards
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
                          variant="destructive"
                          onClick={() => {
                            setSelectedDeckId(deck.id);
                            setConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete deck
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="p-4">
                    <h4 className="mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {deck.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                      {deckSubtitle(deck)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Clock className="w-3 h-3" />
                      <span>{deckDate(deck)}</span>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => onSelectDeck(deck.id)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {deck.cards_count ? "Study" : "Add cards"}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {decks.map((deck, index) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="group hover:shadow-md transition-all p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-8 h-8 text-primary/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="mb-1">{deck.title}</h4>
                      <p className="text-sm text-muted-foreground mb-1">
                        {deckSubtitle(deck)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {deck.cards_count} cards · {deckDate(deck)}
                      </p>
                    </div>
                    <Button onClick={() => onSelectDeck(deck.id)}>
                      <Play className="w-4 h-4 mr-2" />
                      Study
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && decks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Brain className="w-20 h-20 text-muted-foreground/50 mb-4" />
            <h3 className="mb-2">No decks yet</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Create a deck, then add cards while studying.
            </p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create deck
            </Button>
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New flashcard deck</DialogTitle>
            <DialogDescription>
              Optional: link a document for context. Add cards inside study mode.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="deck-title">Title</Label>
              <Input
                id="deck-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Biology terms"
              />
            </div>
            <div className="space-y-2">
              <Label>Document (optional)</Label>
              <Select value={newDocId} onValueChange={setNewDocId}>
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
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void handleCreateDeck()} disabled={saving}>
              {saving ? "Saving…" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void confirmDeleteDeck()}
        title="Delete deck"
        description="This removes the deck and all of its cards."
      />
    </div>
  );
}
