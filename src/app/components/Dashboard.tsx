import { Upload, BookOpen, Brain, FileText, Clock, Flame, FileCheck, Sparkles, Trophy, Target, TrendingUp } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { AddContentDialog } from './AddContentDialog';
import { DashboardSkeleton } from './Skeleton';
import { Skeleton } from './ui/skeleton';
import { motion } from 'motion/react';
import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  fetchDocuments,
  insertDocument,
  type DocumentRow,
} from '@/lib/supabase/documents';
import { fetchDashboardStats } from '@/lib/supabase/quizzes';

interface DashboardProps {
  onNavigateToStudy: (documentId: string) => void;
  onViewLibrary?: () => void;
  userName?: string;
  isLoading?: boolean;
}

interface DashboardDocument {
  id: string;
  title: string;
  type: string;
  progress: number;
  lastAccessed: string;
}

function mapDoc(row: DocumentRow): DashboardDocument {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    progress: row.progress ?? 0,
    lastAccessed: row.last_opened_at
      ? formatDistanceToNow(new Date(row.last_opened_at), { addSuffix: true })
      : 'Not opened yet',
  };
}

// Empty state component
function EmptyLibraryState({ onUpload }: { onUpload: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-12 text-center border-2 border-dashed border-border dark:border-white/10 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="max-w-md mx-auto">
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl blur-xl" />
              <BookOpen className="w-12 h-12 text-primary/60 relative" />
            </div>
          </div>
          <h3 className="mb-3 text-xl">No notes yet?</h3>
          <p className="text-muted-foreground mb-6">
            Upload your first PDF, document, or study material to get started with AI-powered learning
          </p>
          <Button 
            size="lg" 
            onClick={onUpload}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Your First Document
          </Button>
          <div className="mt-6 pt-6 border-t border-border dark:border-white/10">
            <p className="text-xs text-muted-foreground">
              ✨ Pro tip: Start with your most important class notes for maximum impact
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function Dashboard({
  onNavigateToStudy,
  onViewLibrary,
  userName = 'Student',
  isLoading: isLoadingProp = false,
}: DashboardProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getDailyTip = () => {
    const tips = [
      "💡 Tip: Study in 25-minute focused sessions for better retention",
      "🎯 Remember: Consistent practice beats cramming every time",
      "✨ Did you know? Teaching concepts to others deepens your understanding",
      "🧠 Pro tip: Take regular breaks to keep your mind fresh",
      "📚 Success starts with the first page—keep going!"
    ];
    const dayIndex = new Date().getDate() % tips.length;
    return tips[dayIndex];
  };

  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [documents, setDocuments] = useState<DashboardDocument[]>([]);
  const [stats, setStats] = useState({
    documentCount: 0,
    summaryCount: 0,
    flashcardCount: 0,
    avgQuizScore: null as number | null,
  });
  const [loadError, setLoadError] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  const refresh = useCallback(async () => {
    setListLoading(true);
    setLoadError(false);
    try {
      const supabase = getSupabaseBrowserClient();
      const [rows, dash] = await Promise.all([
        fetchDocuments(supabase),
        fetchDashboardStats(supabase),
      ]);
      setDocuments(rows.map(mapDoc));
      setStats(dash);
    } catch {
      setLoadError(true);
      toast.error('Could not load dashboard. Did you run the latest SQL migrations?');
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleLibraryAdd = async (input: {
    title: string;
    type: string;
    body_text?: string | null;
  }) => {
    try {
      const supabase = getSupabaseBrowserClient();
      await insertDocument(supabase, {
        title: input.title,
        type: input.type,
        processed: false,
        body_text: input.body_text ?? null,
      });
      await refresh();
      toast.success('Document added');
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Could not add document.',
      );
      throw e;
    }
  };

  if (isLoadingProp) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto p-3 lg:p-8 pb-20 lg:pb-8 space-y-4 lg:space-y-8">
        {/* Hero Welcome Section - Focused on Status & Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden"
        >
          <Card className="border-0 bg-gradient-to-br from-primary via-primary/90 to-indigo-900 text-primary-foreground relative overflow-hidden shadow-xl">
            {/* Mesh Gradient Overlays */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0deg,_rgba(255,255,255,0.05)_90deg,_transparent_180deg)] opacity-40" />
            
            <div className="relative p-5 lg:p-12">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 lg:w-6 lg:h-6 text-secondary animate-pulse" />
                    <span className="text-xs lg:text-sm font-medium text-primary-foreground/80">Welcome back!</span>
                  </div>
                  <h1 className="mb-2 lg:mb-3 text-white text-2xl lg:text-4xl">
                    {getGreeting()}, {userName}
                  </h1>
                  <p className="text-sm lg:text-lg text-primary-foreground/90 max-w-2xl mb-4 lg:mb-6">
                    {getDailyTip()}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 lg:gap-6 text-xs lg:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                      <span className="text-primary-foreground/80">5-day streak</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                      <span className="text-primary-foreground/80">
                        {stats.documentCount} material{stats.documentCount === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="relative">
                    <div className="absolute inset-0 bg-secondary/30 blur-3xl rounded-full" />
                    <div className="relative w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-2xl rotate-3 hover:rotate-6 transition-transform duration-300">
                      <Brain className="w-16 h-16 text-white drop-shadow-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
        >
          <Card className="p-3 lg:p-4 hover:shadow-lg transition-all duration-300 border border-border dark:border-white/10 rounded-2xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Flame className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl lg:text-2xl font-bold">—</p>
              </div>
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground">Day Streak 🔥</p>
          </Card>

          <Card className="p-3 lg:p-4 hover:shadow-lg transition-all duration-300 border border-border dark:border-white/10 rounded-2xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <FileCheck className="w-4 h-4 lg:w-5 lg:h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-xl lg:text-2xl font-bold">{stats.documentCount}</p>
              </div>
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground">Documents</p>
          </Card>

          <Card className="p-3 lg:p-4 hover:shadow-lg transition-all duration-300 border border-border dark:border-white/10 rounded-2xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Trophy className="w-4 h-4 lg:w-5 lg:h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xl lg:text-2xl font-bold">
                  {stats.avgQuizScore != null ? `${stats.avgQuizScore}%` : '—'}
                </p>
              </div>
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground">Avg Score</p>
          </Card>

          <Card className="p-3 lg:p-4 hover:shadow-lg transition-all duration-300 border border-border dark:border-white/10 rounded-2xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Target className="w-4 h-4 lg:w-5 lg:h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xl lg:text-2xl font-bold">{stats.flashcardCount}</p>
              </div>
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground">Flashcards</p>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h3 className="mb-3 lg:mb-4 text-lg lg:text-xl">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
            {/* Upload Card - Dominant */}
            <Card 
              className="md:col-span-2 p-5 lg:p-8 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 cursor-pointer group bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 border-2 border-primary/30 dark:border-primary/20 rounded-2xl relative overflow-hidden"
              onClick={() => setUploadDialogOpen(true)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-start gap-4 lg:gap-6">
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shrink-0">
                  <Upload className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 lg:mb-2">
                    <h4 className="text-base lg:text-xl">Upload Document</h4>
                    <Sparkles className="w-3 h-3 lg:w-4 lg:h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs lg:text-sm text-muted-foreground mb-3 lg:mb-4">
                    Drop your PDFs, notes, or study materials to unlock AI-powered learning
                  </p>
                  <div className="flex items-center gap-2 text-xs lg:text-sm text-primary">
                    <span className="font-medium">Get Started</span>
                    <svg className="w-3 h-3 lg:w-4 lg:h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Card>

            {/* Other Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-3 lg:gap-4">
              <Card 
                className="p-4 lg:p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20 dark:border-secondary/10 rounded-2xl"
              >
                <div className="flex flex-col md:flex-row items-start gap-3 lg:gap-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                    <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <h4 className="mb-0.5 lg:mb-1 text-sm lg:text-base">AI Summary</h4>
                    <p className="text-xs lg:text-sm text-muted-foreground">Generate notes</p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 lg:p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 dark:border-accent/10 rounded-2xl"
              >
                <div className="flex flex-col md:flex-row items-start gap-3 lg:gap-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                    <Brain className="w-5 h-5 lg:w-6 lg:h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h4 className="mb-0.5 lg:mb-1 text-sm lg:text-base">Practice Quiz</h4>
                    <p className="text-xs lg:text-sm text-muted-foreground">Test knowledge</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Recent Documents */}
        <div>
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div>
              <h2 className="mb-0.5 lg:mb-1 text-lg lg:text-2xl">Continue Learning</h2>
              <p className="text-xs lg:text-sm text-muted-foreground">Pick up where you left off</p>
            </div>
            {documents.length > 0 && onViewLibrary && (
              <Button
                variant="ghost"
                className="text-primary text-sm lg:text-base"
                onClick={onViewLibrary}
              >
                View All
              </Button>
            )}
          </div>

          {listLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {[0, 1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden rounded-2xl">
                  <Skeleton className="h-28 lg:h-32 w-full" />
                  <div className="p-3 lg:p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-1.5 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : loadError ? (
            <p className="text-sm text-muted-foreground">Something went wrong while loading your library.</p>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {documents.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
                >
                  <Card 
                    className="group hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer overflow-hidden rounded-2xl border border-border dark:border-white/10"
                    onClick={() => onNavigateToStudy(doc.id)}
                  >
                    {/* Thumbnail/Icon Area */}
                    <div className="h-28 lg:h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                      <FileText className="w-10 h-10 lg:w-12 lg:h-12 text-primary/40 group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                      {doc.progress > 0 && (
                        <div className="absolute top-2 lg:top-3 right-2 lg:right-3 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-primary">
                          {doc.progress}%
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 lg:p-4">
                      <h4 className="mb-1.5 lg:mb-2 line-clamp-2 group-hover:text-primary transition-colors text-sm lg:text-base">
                        {doc.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 lg:mb-3">
                        <Clock className="w-3 h-3" />
                        <span>{doc.lastAccessed}</span>
                      </div>
                      
                      {/* Progress */}
                      <div className="space-y-1.5 lg:space-y-2">
                        <Progress value={doc.progress} className="h-1.5" />
                        <div className="flex items-center gap-1 text-xs">
                          <TrendingUp className="w-3 h-3 text-secondary-foreground" />
                          <span className="text-muted-foreground">Keep going!</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyLibraryState onUpload={() => setUploadDialogOpen(true)} />
          )}
        </div>
      </div>
      <AddContentDialog
        open={isUploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        mode="library"
        onLibraryAdd={handleLibraryAdd}
      />
    </div>
  );
}