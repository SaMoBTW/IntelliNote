import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Check, X, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  fetchCardsForDeck,
  insertFlashcard,
  type FlashcardRow,
} from "@/lib/supabase/flashcards";

interface FlashcardModeProps {
  deckId: string;
  onBack: () => void;
}

type CardUI = { id: string; question: string; answer: string };

export function FlashcardMode({ deckId, onBack }: FlashcardModeProps) {
  const [cards, setCards] = useState<CardUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [adding, setAdding] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<string[]>([]);
  const [studyAgainCards, setStudyAgainCards] = useState<string[]>([]);

  const mapRow = (r: FlashcardRow): CardUI => ({
    id: r.id,
    question: r.front,
    answer: r.back,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const rows = await fetchCardsForDeck(supabase, deckId);
      setCards(rows.map(mapRow));
      setCurrentIndex(0);
      setIsFlipped(false);
      setKnownCards([]);
      setStudyAgainCards([]);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not load flashcards.",
      );
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAddCard = async () => {
    const f = newFront.trim();
    const b = newBack.trim();
    if (!f || !b) {
      toast.error("Enter both front and back.");
      return;
    }
    setAdding(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const row = await insertFlashcard(supabase, {
        deck_id: deckId,
        front: f,
        back: b,
        sort_order: cards.length,
      });
      setCards((prev) => [...prev, mapRow(row)]);
      setNewFront("");
      setNewBack("");
      toast.success("Card added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not add card.");
    } finally {
      setAdding(false);
    }
  };

  const currentCard = cards[currentIndex];
  const progress =
    cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;
  const isLastCard = cards.length > 0 && currentIndex === cards.length - 1;
  const isComplete =
    cards.length > 0 &&
    isLastCard &&
    currentCard &&
    (knownCards.includes(currentCard.id) ||
      studyAgainCards.includes(currentCard.id));

  const handleKnow = () => {
    if (!currentCard) return;
    setKnownCards([...knownCards, currentCard.id]);
    nextCard();
  };

  const handleStudyAgain = () => {
    if (!currentCard) return;
    setStudyAgainCards([...studyAgainCards, currentCard.id]);
    nextCard();
  };

  const nextCard = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCards([]);
    setStudyAgainCards([]);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Loading cards…
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <div className="border-b border-border bg-card/80 backdrop-blur-sm px-4 lg:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to decks
          </Button>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="text-sm text-muted-foreground">
              {cards.length ? `${currentIndex + 1} / ${cards.length}` : "0 cards"}
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Reset</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6 py-4 bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="w-full max-w-4xl mx-auto space-y-8">
          {cards.length === 0 ? (
            <Card className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                No cards in this deck yet. Add your first card below.
              </p>
              <div className="space-y-2">
                <Label>Front (question)</Label>
                <Input
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="Question or term"
                />
              </div>
              <div className="space-y-2">
                <Label>Back (answer)</Label>
                <Input
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="Answer or definition"
                />
              </div>
              <Button onClick={() => void handleAddCard()} disabled={adding}>
                {adding ? "Adding…" : "Add card"}
              </Button>
            </Card>
          ) : !isComplete ? (
            <div className="space-y-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="perspective-1000"
              >
                <motion.div
                  className="relative h-96 cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: "spring" }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Card
                    className="absolute inset-0 flex flex-col items-center justify-center p-12 shadow-2xl bg-gradient-to-br from-card to-card/80"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <Sparkles className="w-5 h-5 text-secondary" />
                      <span className="text-sm text-muted-foreground">Front</span>
                    </div>
                    <h2 className="text-center mb-8">{currentCard.question}</h2>
                    <p className="text-sm text-muted-foreground">Click to flip</p>
                  </Card>

                  <Card
                    className="absolute inset-0 flex flex-col items-center justify-center p-12 shadow-2xl bg-gradient-to-br from-secondary/10 to-primary/10"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: isFlipped ? "rotateY(0deg)" : "rotateY(-180deg)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">Back</span>
                    </div>
                    <p className="text-center leading-relaxed px-4">
                      {currentCard.answer}
                    </p>
                  </Card>
                </motion.div>
              </motion.div>

              <AnimatePresence>
                {isFlipped && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="flex justify-center gap-4"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 border-destructive/50 hover:bg-destructive/10 hover:text-destructive min-w-40"
                      onClick={handleStudyAgain}
                    >
                      <X className="w-5 h-5" />
                      Again
                    </Button>
                    <Button
                      size="lg"
                      className="gap-2 bg-green-600 hover:bg-green-700 text-white min-w-40"
                      onClick={handleKnow}
                    >
                      <Check className="w-5 h-5" />
                      Got it
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <Card className="p-4 space-y-3">
                <p className="text-sm font-medium">Add another card</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Front"
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                  />
                  <Input
                    placeholder="Back"
                    value={newBack}
                    onChange={(e) => setNewBack(e.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void handleAddCard()}
                  disabled={adding}
                >
                  {adding ? "Adding…" : "Add to deck"}
                </Button>
              </Card>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <Card className="p-12 shadow-2xl">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h1 className="mb-4">Round complete</h1>
                <p className="text-muted-foreground mb-8">
                  You went through all {cards.length} cards once.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
                  <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                    <div className="text-3xl mb-2">{knownCards.length}</div>
                    <div className="text-sm text-muted-foreground">Got it</div>
                  </Card>
                  <Card className="p-4 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                    <div className="text-3xl mb-2">{studyAgainCards.length}</div>
                    <div className="text-sm text-muted-foreground">Again</div>
                  </Card>
                </div>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={onBack}>
                    Back to decks
                  </Button>
                  <Button onClick={handleReset} className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Study again
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
