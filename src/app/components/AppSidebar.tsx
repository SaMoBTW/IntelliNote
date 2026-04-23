import { Home, Library, Clock, Brain, Settings, Moon, Sun, Sparkles, LogOut, ClipboardList, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import type { AppView, SidebarNavView } from '../views';

interface AppSidebarProps {
  activeView: AppView;
  onNavigate: (view: SidebarNavView) => void;
  onLogout?: () => void;
}

const menuItems = [
  { id: 'dashboard' as const, label: 'Home', icon: Home },
  { id: 'library' as const, label: 'My Library', icon: Library },
  { id: 'summary' as const, label: 'Summaries', icon: FileText },
  { id: 'flashcards' as const, label: 'Flashcards', icon: Brain },
  { id: 'quizzes' as const, label: 'Quizzes', icon: ClipboardList },
];

export function AppSidebar({ activeView, onNavigate, onLogout }: AppSidebarProps) {
  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <Logo size="md" variant="light" showText={true} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.id === activeView;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    isActive ? 'bg-primary text-primary-foreground' : ''
                  }`}
                  onClick={() => onNavigate(item.id)}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      {onLogout && (
        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={onLogout}>
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}