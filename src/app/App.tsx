import { useState, useEffect, useMemo } from 'react';
import { AppSidebar } from './components/AppSidebar';
import { Dashboard } from './components/Dashboard';
import { Library } from './components/Library';
import { Summary } from './components/Summary';
import { SummaryDetailView } from './components/SummaryDetailView';
import { StudyView } from './components/StudyView';
import { FlashcardMode } from './components/FlashcardMode';
import { FlashcardLibrary } from './components/FlashcardLibrary';
import { Quizzes } from './components/Quizzes';
import { QuizView } from './components/QuizView';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { TopBar } from './components/TopBar';
import { Home, Library as LibraryIcon, FileText, Brain, ClipboardList } from 'lucide-react';
import { AddContentDialog } from './components/AddContentDialog';
import type { AppView, SidebarNavView } from './views';
import { useAuth } from './auth/AuthContext';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { user, session, loading: authLoading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [selectedFlashcardDeckId, setSelectedFlashcardDeckId] = useState<string | null>(null);
  const [isAddContentDialogOpen, setAddContentDialogOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const userName = useMemo(() => {
    if (!user) return 'Student';
    const meta = user.user_metadata as { full_name?: string } | undefined;
    if (meta?.full_name?.trim()) return meta.full_name.trim();
    if (user.email) return user.email.split('@')[0] ?? 'Student';
    return 'Student';
  }, [user]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    await signOut();
    setCurrentView('dashboard');
    setSelectedDocumentId(null);
    setSelectedSummaryId(null);
  };

  const handleNavigateToStudy = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setCurrentView('study');
  };

  const handleNavigateToSummary = (summaryId: string) => {
    setSelectedSummaryId(summaryId);
    setCurrentView('summary-detail');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedDocumentId(null);
    setSelectedSummaryId(null);
  };

  const handleBackToSummaries = () => {
    setCurrentView('summary');
    setSelectedSummaryId(null);
  };

  const handleGenerateQuiz = () => {
    setCurrentView('flashcards');
  };

  const handleBackToStudy = () => {
    setCurrentView('study');
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Generate breadcrumbs based on current view
  const getBreadcrumbs = () => {
    if (currentView === 'dashboard') {
      return [{ label: 'Home' }];
    } else if (currentView === 'library') {
      return [{ label: 'My Library' }];
    } else if (currentView === 'summary') {
      return [{ label: 'Summaries' }];
    } else if (currentView === 'summary-detail') {
      return [
        { label: 'Summaries', href: '#' },
        { label: 'Biology 101 Notes' },
      ];
    } else if (currentView === 'quizzes') {
      return [{ label: 'Quizzes' }];
    } else if (currentView === 'study') {
      return [
        { label: 'Library', href: '#' },
        { label: 'Biology 101 Notes' },
      ];
    } else if (currentView === 'flashcards') {
      return [{ label: 'Flashcards' }];
    } else if (currentView === 'settings') {
      return [{ label: 'Settings' }];
    }
    return [{ label: 'Home' }];
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="size-full flex bg-background text-foreground">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:block">
        <AppSidebar
          activeView={currentView}
          onNavigate={(view: SidebarNavView) => setCurrentView(view)}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar 
          breadcrumbs={getBreadcrumbs()} 
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onOpenSettings={() => setCurrentView('settings')}
        />
        
        {currentView === 'dashboard' && (
          <Dashboard
            onNavigateToStudy={handleNavigateToStudy}
            onViewLibrary={() => setCurrentView('library')}
            userName={userName}
          />
        )}

        {currentView === 'library' && (
          <Library onSelectDocument={handleNavigateToStudy} />
        )}

        {currentView === 'summary' && (
          <Summary onSelectSummary={handleNavigateToSummary} />
        )}

        {currentView === 'summary-detail' && selectedSummaryId && (
          <SummaryDetailView
            summaryId={selectedSummaryId}
            onBack={handleBackToSummaries}
            onGenerateQuiz={handleGenerateQuiz}
          />
        )}

        {currentView === 'quizzes' && (
          <Quizzes onStartQuiz={(quizId) => {
            setSelectedQuizId(quizId);
            setCurrentView('quiz-taking');
          }} />
        )}

        {currentView === 'quiz-taking' && selectedQuizId && (
          <QuizView
            quizId={selectedQuizId}
            onBack={() => setCurrentView('quizzes')}
            onComplete={(score) => {
              // In a real app, save the score here
              console.log('Quiz completed with score:', score);
            }}
          />
        )}
        
        {currentView === 'study' && selectedDocumentId && (
          <StudyView
            documentId={selectedDocumentId}
            onBack={handleBackToDashboard}
            onGenerateQuiz={handleGenerateQuiz}
          />
        )}

        {currentView === 'flashcards' && (
          <FlashcardLibrary
            onSelectDeck={(deckId) => {
              setSelectedFlashcardDeckId(deckId);
              setCurrentView('flashcard-study');
            }}
          />
        )}

        {currentView === 'flashcard-study' && selectedFlashcardDeckId && (
          <FlashcardMode
            deckId={selectedFlashcardDeckId}
            onBack={() => setCurrentView('flashcards')}
          />
        )}

        {currentView === 'settings' && (
          <Settings userName={userName} onClose={() => setCurrentView('dashboard')} />
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md border-t border-border p-2 flex justify-around items-center z-50 shadow-lg">
        <button
          onClick={() => setCurrentView('library')}
          className={`flex flex-col items-center gap-0.5 px-3 py-2 min-w-0 rounded-xl transition-all duration-200 ${
            currentView === 'library' 
              ? 'text-primary bg-primary/10 scale-110' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <LibraryIcon className={`transition-all duration-200 ${
            currentView === 'library' ? 'w-6 h-6' : 'w-5 h-5'
          }`} />
          <span className="text-[10px] font-medium">Library</span>
        </button>
        <button
          onClick={() => setCurrentView('summary')}
          className={`flex flex-col items-center gap-0.5 px-3 py-2 min-w-0 rounded-xl transition-all duration-200 ${
            currentView === 'summary' 
              ? 'text-primary bg-primary/10 scale-110' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className={`transition-all duration-200 ${
            currentView === 'summary' ? 'w-6 h-6' : 'w-5 h-5'
          }`} />
          <span className="text-[10px] font-medium">Summary</span>
        </button>
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center gap-0.5 px-3 py-2 min-w-0 rounded-xl transition-all duration-200 ${
            currentView === 'dashboard' 
              ? 'text-primary bg-primary/10 scale-110' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Home className={`transition-all duration-200 ${
            currentView === 'dashboard' ? 'w-6 h-6' : 'w-5 h-5'
          }`} />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button
          onClick={() => setCurrentView('flashcards')}
          className={`flex flex-col items-center gap-0.5 px-3 py-2 min-w-0 rounded-xl transition-all duration-200 ${
            currentView === 'flashcards' 
              ? 'text-primary bg-primary/10 scale-110' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Brain className={`transition-all duration-200 ${
            currentView === 'flashcards' ? 'w-6 h-6' : 'w-5 h-5'
          }`} />
          <span className="text-[10px] font-medium">Cards</span>
        </button>
        <button
          onClick={() => setCurrentView('quizzes')}
          className={`flex flex-col items-center gap-0.5 px-3 py-2 min-w-0 rounded-xl transition-all duration-200 ${
            currentView === 'quizzes' 
              ? 'text-primary bg-primary/10 scale-110' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ClipboardList className={`transition-all duration-200 ${
            currentView === 'quizzes' ? 'w-6 h-6' : 'w-5 h-5'
          }`} />
          <span className="text-[10px] font-medium">Quizzes</span>
        </button>
      </div>

      {/* Add Content Dialog */}
      <AddContentDialog 
        open={isAddContentDialogOpen} 
        onClose={() => setAddContentDialogOpen(false)} 
        mode="flashcards" 
      />
    </div>
  );
}