import {
  Brain,
  Clock,
  CheckCircle2,
  Trophy,
  Play,
  Plus,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { AddQuizDialog } from "./AddQuizDialog";
import { ConfirmDialog } from "./ConfirmDialog";
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
  deleteQuiz,
  fetchQuizzesList,
  type QuizListItem,
} from "@/lib/supabase/quizzes";

interface QuizzesProps {
  onStartQuiz?: (quizId: string) => void;
}

type QuizCard = {
  id: string;
  title: string;
  documentTitle: string;
  dateCreated: string;
  questionsCount: number;
  completed: boolean;
  score?: number;
};

function toCard(q: QuizListItem): QuizCard {
  const d = new Date(q.created_at);
  return {
    id: q.id,
    title: q.title,
    documentTitle: q.document_title ?? "—",
    dateCreated: Number.isNaN(d.getTime())
      ? q.created_at
      : format(d, "MMM d, yyyy"),
    questionsCount: q.questions_count,
    completed: q.completed,
    score: q.score,
  };
}

export function Quizzes({ onStartQuiz }: QuizzesProps) {
  const [activeTab, setActiveTab] = useState<"all" | "completed" | "pending">(
    "all",
  );
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [quizzes, setQuizzes] = useState<QuizCard[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const rows = await fetchQuizzesList(supabase);
      setQuizzes(rows.map(toCard));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load quizzes.");
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredQuizzes = quizzes.filter((quiz) => {
    if (activeTab === "completed") return quiz.completed;
    if (activeTab === "pending") return !quiz.completed;
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-secondary";
    if (score >= 70) return "text-primary";
    return "text-destructive";
  };

  const handleDeleteQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setConfirmDialogOpen(true);
  };

  const confirmDeleteQuiz = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      await deleteQuiz(supabase, selectedQuizId);
      setQuizzes((prev) => prev.filter((q) => q.id !== selectedQuizId));
      toast.success("Quiz deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete quiz.");
    }
    setSelectedQuizId("");
  };

  const scored = quizzes.filter((q) => q.score != null);
  const avgScore =
    scored.length > 0
      ? Math.round(
          scored.reduce((a, q) => a + (q.score ?? 0), 0) / scored.length,
        )
      : 0;

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto p-4 lg:p-8 pb-20 lg:pb-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-6 h-6 text-primary" />
                <h1>Quizzes</h1>
              </div>
              <p className="text-muted-foreground">
                Practice quizzes (per-user). New quizzes include a sample question.
              </p>
            </div>
            <Button onClick={() => setAddDialogOpen(true)} disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">New quiz</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-semibold">{quizzes.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-semibold">
                  {quizzes.filter((q) => q.completed).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. score</p>
                <p className="text-2xl font-semibold">
                  {scored.length ? `${avgScore}%` : "—"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            onClick={() => setActiveTab("all")}
          >
            All
          </Button>
          <Button
            variant={activeTab === "completed" ? "default" : "outline"}
            onClick={() => setActiveTab("completed")}
          >
            Completed
          </Button>
          <Button
            variant={activeTab === "pending" ? "default" : "outline"}
            onClick={() => setActiveTab("pending")}
          >
            Pending
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="group hover:shadow-lg transition-all">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="mb-1">{quiz.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          From: {quiz.documentTitle}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {quiz.completed ? (
                          <Badge className="bg-secondary text-secondary-foreground">
                            Done
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDeleteQuiz(quiz.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Created {quiz.dateCreated}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Brain className="w-4 h-4" />
                        <span>{quiz.questionsCount} questions</span>
                      </div>
                    </div>

                    {quiz.completed && quiz.score !== undefined && (
                      <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">
                            Last score
                          </span>
                          <span
                            className={`text-2xl font-bold ${getScoreColor(quiz.score)}`}
                          >
                            {quiz.score}%
                          </span>
                        </div>
                        <Progress value={quiz.score} className="h-2" />
                      </div>
                    )}

                    <Button
                      className="w-full"
                      variant={quiz.completed ? "outline" : "default"}
                      onClick={() => onStartQuiz?.(quiz.id)}
                      disabled={quiz.questionsCount === 0}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {quiz.completed ? "Retake" : "Start"}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredQuizzes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Brain className="w-20 h-20 text-muted-foreground/50 mb-4" />
            <h3 className="mb-2">No quizzes</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Create a quiz to get a sample question you can try right away.
            </p>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New quiz
            </Button>
          </div>
        )}
      </div>

      <AddQuizDialog
        open={isAddDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onCreated={() => void load()}
      />

      <ConfirmDialog
        open={isConfirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={() => void confirmDeleteQuiz()}
        title="Delete quiz"
        description="This removes the quiz, its questions, and attempts."
      />
    </div>
  );
}
