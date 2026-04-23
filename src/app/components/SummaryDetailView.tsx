import { ArrowLeft, Sparkles, FileText, Clock, Copy, Download, Share2, CheckCircle2, BookOpen, Brain } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { fetchSummaryById } from '@/lib/supabase/summaries';

interface SummaryDetailViewProps {
  summaryId: string;
  onBack: () => void;
  onGenerateQuiz?: () => void;
}

interface SummaryData {
  id: string;
  documentTitle: string;
  dateCreated: string;
  keyPoints: string[];
  fullSummary: string;
  wordCount: number;
  readingTime: number;
}

export function SummaryDetailView({ summaryId, onBack, onGenerateQuiz }: SummaryDetailViewProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const supabase = getSupabaseBrowserClient();
        const row = await fetchSummaryById(supabase, summaryId);
        if (!row) {
          setSummary(null);
          return;
        }
        const d = new Date(row.created_at);
        setSummary({
          id: row.id,
          documentTitle: row.document_title,
          dateCreated: Number.isNaN(d.getTime())
            ? row.created_at
            : format(d, "MMM d, yyyy"),
          keyPoints: row.key_points,
          fullSummary: row.full_summary,
          wordCount: row.word_count,
          readingTime: Math.max(1, Math.ceil(row.word_count / 200)),
        });
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Could not load summary.",
        );
        setSummary(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [summaryId]);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleCopyAll = () => {
    if (!summary) return;
    const fullText = `${summary.documentTitle}\n\nKey Points:\n${summary.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nSummary:\n${summary.fullSummary}`;
    navigator.clipboard.writeText(fullText);
    setCopiedSection('all');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground">
        Loading summary…
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">Summary not found.</p>
        <Button onClick={onBack}>Back</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 lg:px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Summaries
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAll}
              >
                {copiedSection === 'all' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-secondary" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-primary" />
                <h2>{summary.documentTitle}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{summary.dateCreated}</span>
                </div>
                <span>•</span>
                <span>{summary.wordCount} words</span>
                <span>•</span>
                <span>{summary.readingTime} min read</span>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Saved summary
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-muted/30">
        <div className="max-w-5xl mx-auto p-4 lg:p-8 pb-20 lg:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - 2/3 width on desktop */}
            <div className="lg:col-span-2 space-y-6">
              {/* Full Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="p-6 lg:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <h3>Full Summary</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(summary.fullSummary, 'summary')}
                    >
                      {copiedSection === 'summary' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2 text-secondary" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="prose prose-sm max-w-none">
                    {summary.fullSummary.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="text-foreground/90 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* AI Insights Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card className="p-6 lg:p-8 bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-5 h-5 text-primary" />
                    <h3>AI Study Suggestions</h3>
                    <Sparkles className="w-4 h-4 text-primary ml-auto" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-background/60 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary">1</span>
                      </div>
                      <div>
                        <h4 className="text-sm mb-1">Create Flashcards</h4>
                        <p className="text-sm text-muted-foreground">
                          Convert these key points into flashcards for better retention
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-background/60 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary">2</span>
                      </div>
                      <div>
                        <h4 className="text-sm mb-1">Take a Quiz</h4>
                        <p className="text-sm text-muted-foreground">
                          Test your understanding with an AI-generated quiz
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-background/60 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary">3</span>
                      </div>
                      <div>
                        <h4 className="text-sm mb-1">Review in 24 Hours</h4>
                        <p className="text-sm text-muted-foreground">
                          Spaced repetition improves long-term memory retention
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar - 1/3 width on desktop */}
            <div className="space-y-6">
              {/* Key Points Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
              >
                <Card className="p-6 sticky top-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base">Key Points</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(summary.keyPoints.join('\n'), 'keypoints')}
                    >
                      {copiedSection === 'keypoints' ? (
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  <ul className="space-y-3">
                    {summary.keyPoints.map((point, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-primary">{idx + 1}</span>
                        </div>
                        <span className="text-sm text-foreground/90">{point}</span>
                      </motion.li>
                    ))}
                  </ul>
                </Card>
              </motion.div>

              {/* Quick Actions Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <Card className="p-6">
                  <h3 className="text-base mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Flashcards
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={onGenerateQuiz}>
                      <Brain className="w-4 h-4 mr-2" />
                      Create Quiz
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      View Original Document
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}