import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, ChevronRight, ChevronLeft, Trophy, Clock, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  fetchQuestionsForQuiz,
  insertQuizAttempt,
} from '@/lib/supabase/quizzes';

interface QuizViewProps {
  quizId: string;
  onBack: () => void;
  onComplete: (score: number) => void;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizData {
  id: string;
  title: string;
  documentTitle: string;
  questions: Question[];
  timeLimit?: number;
}

const emptyQuiz: QuizData = {
  id: '',
  title: '',
  documentTitle: '',
  questions: [],
};

export function QuizView({ quizId, onBack, onComplete }: QuizViewProps) {
  const [quiz, setQuiz] = useState<QuizData>(emptyQuiz);
  const [loadStatus, setLoadStatus] = useState<
    'loading' | 'ready' | 'empty' | 'error'
  >('loading');

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    void (async () => {
      setLoadStatus('loading');
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: meta, error: metaErr } = await supabase
          .from('quizzes')
          .select('title, document_id')
          .eq('id', quizId)
          .single();
        if (metaErr) throw metaErr;

        let docTitle = '';
        if (meta?.document_id) {
          const { data: doc } = await supabase
            .from('documents')
            .select('title')
            .eq('id', meta.document_id)
            .maybeSingle();
          docTitle = doc?.title ?? '';
        }

        const qs = await fetchQuestionsForQuiz(supabase, quizId);
        const questions: Question[] = qs.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options.length ? q.options : ['(no options)'],
          correctAnswer: q.correct_index,
          explanation: q.explanation ?? undefined,
        }));

        setQuiz({
          id: quizId,
          title: meta?.title ?? 'Quiz',
          documentTitle: docTitle,
          questions,
        });
        setLoadStatus(questions.length ? 'ready' : 'empty');
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : 'Could not load quiz.',
        );
        setLoadStatus('error');
      }
    })();
  }, [quizId]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion =
    quiz.questions.length > 0 &&
    currentQuestionIndex === quiz.questions.length - 1;
  const hasAnsweredCurrent =
    currentQuestion !== undefined &&
    selectedAnswers[currentQuestion.id] !== undefined;

  const handleSelectAnswer = (optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: optionIndex,
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Submit quiz
      handleSubmit();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    if (quiz.questions.length === 0) return 0;
    let correct = 0;
    quiz.questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setTimeRemaining(quiz.timeLimit ? quiz.timeLimit * 60 : null);
  };

  const handleFinish = () => {
    void (async () => {
      const score = calculateScore();
      try {
        const supabase = getSupabaseBrowserClient();
        await insertQuizAttempt(supabase, quizId, score);
      } catch {
        toast.error('Could not save your score.');
      }
      onComplete(score);
      onBack();
    })();
  };

  if (loadStatus === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground p-8">
        Loading quiz…
      </div>
    );
  }

  if (loadStatus === 'error') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">Could not load this quiz.</p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  if (loadStatus === 'empty' || quiz.questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center max-w-md mx-auto">
        <p className="text-muted-foreground">
          This quiz has no questions yet. Add questions in the database or use a future editor.
        </p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to quizzes
        </Button>
      </div>
    );
  }

  // Results View
  if (showResults) {
    const score = calculateScore();
    const correctCount = Math.round((score / 100) * quiz.questions.length);
    
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-card px-4 lg:px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2>{quiz.title}</h2>
                <p className="text-sm text-muted-foreground">Quiz Results</p>
              </div>
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quizzes
              </Button>
            </div>
          </div>
        </div>

        {/* Results Content */}
        <div className="flex-1 overflow-auto bg-muted/30">
          <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-20 lg:pb-8">
            {/* Score Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-8 mb-8 text-center bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <h1 className="mb-2">
                  {score >= 90 ? 'Excellent!' : score >= 70 ? 'Great Job!' : score >= 50 ? 'Good Effort!' : 'Keep Practicing!'}
                </h1>
                <p className="text-muted-foreground mb-6">You scored</p>
                <div className="text-6xl font-bold text-primary mb-2">{score}%</div>
                <p className="text-muted-foreground">
                  {correctCount} out of {quiz.questions.length} correct
                </p>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <Button variant="outline" className="flex-1" onClick={handleRetake}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
              <Button className="flex-1" onClick={handleFinish}>
                Finish
              </Button>
            </div>

            {/* Question Review */}
            <h3 className="mb-4">Review Answers</h3>
            <div className="space-y-4">
              {quiz.questions.map((question, index) => {
                const userAnswer = selectedAnswers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCorrect ? 'bg-secondary/20' : 'bg-destructive/20'
                        }`}>
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-secondary-foreground" />
                          ) : (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="flex-1">
                              {index + 1}. {question.question}
                            </h4>
                            <Badge className={isCorrect ? 'bg-secondary text-secondary-foreground' : 'bg-destructive'}>
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 mb-3">
                            {question.options.map((option, optionIndex) => {
                              const isUserAnswer = userAnswer === optionIndex;
                              const isCorrectAnswer = question.correctAnswer === optionIndex;
                              
                              return (
                                <div
                                  key={optionIndex}
                                  className={`p-3 rounded-lg border-2 ${
                                    isCorrectAnswer
                                      ? 'bg-secondary/10 border-secondary'
                                      : isUserAnswer
                                      ? 'bg-destructive/10 border-destructive'
                                      : 'bg-muted/50 border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {isCorrectAnswer && (
                                      <CheckCircle2 className="w-4 h-4 text-secondary-foreground" />
                                    )}
                                    {isUserAnswer && !isCorrectAnswer && (
                                      <XCircle className="w-4 h-4 text-destructive" />
                                    )}
                                    <span className={isCorrectAnswer ? 'font-medium' : ''}>
                                      {option}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {question.explanation && (
                            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">Explanation: </span>
                                {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Taking View
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 lg:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2>{quiz.title}</h2>
              <p className="text-sm text-muted-foreground">From: {quiz.documentTitle}</p>
            </div>
            <div className="flex items-center gap-4">
              {timeRemaining && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-mono">
                    {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                  </span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-auto bg-muted/30">
        <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-20 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 lg:p-8 mb-6">
                {/* Question */}
                <div className="mb-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">{currentQuestionIndex + 1}</span>
                    </div>
                    <h3 className="flex-1">{currentQuestion.question}</h3>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswers[currentQuestion.id] === index;
                    
                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleSelectAnswer(index)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-card hover:border-primary/50 hover:bg-accent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <span className={isSelected ? 'font-medium' : ''}>{option}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </Card>

              {/* Navigation */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!hasAnsweredCurrent}
                  className="flex-1"
                >
                  {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
                  {!isLastQuestion && <ChevronRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
