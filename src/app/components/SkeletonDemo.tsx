import { useState } from 'react';
import { Button } from './ui/button';
import { DashboardSkeleton, LibrarySkeleton } from './Skeleton';
import { Dashboard } from './Dashboard';
import { Library } from './Library';
import { Card } from './ui/card';

export function SkeletonDemo() {
  const [isDashboardLoading, setDashboardLoading] = useState(false);
  const [isLibraryLoading, setLibraryLoading] = useState(false);
  const [currentDemo, setCurrentDemo] = useState<'dashboard' | 'library'>('dashboard');

  const simulateLoading = (type: 'dashboard' | 'library') => {
    if (type === 'dashboard') {
      setDashboardLoading(true);
      setTimeout(() => setDashboardLoading(false), 3000);
    } else {
      setLibraryLoading(true);
      setTimeout(() => setLibraryLoading(false), 3000);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Demo Controls */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border p-4">
        <Card className="max-w-4xl mx-auto p-4">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div>
              <h3 className="mb-1">Skeleton Loading Demo</h3>
              <p className="text-sm text-muted-foreground">
                Test the loading states for different screens
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={currentDemo === 'dashboard' ? 'default' : 'outline'}
                onClick={() => setCurrentDemo('dashboard')}
                size="sm"
              >
                Dashboard
              </Button>
              <Button
                variant={currentDemo === 'library' ? 'default' : 'outline'}
                onClick={() => setCurrentDemo('library')}
                size="sm"
              >
                Library
              </Button>
              <Button
                onClick={() => simulateLoading(currentDemo)}
                disabled={isDashboardLoading || isLibraryLoading}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                {(currentDemo === 'dashboard' && isDashboardLoading) ||
                (currentDemo === 'library' && isLibraryLoading)
                  ? 'Loading...'
                  : 'Show Loading'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Demo Content */}
      {currentDemo === 'dashboard' && (
        isDashboardLoading ? (
          <DashboardSkeleton />
        ) : (
          <Dashboard onNavigateToStudy={() => {}} userName="Demo User" />
        )
      )}

      {currentDemo === 'library' && (
        isLibraryLoading ? (
          <LibrarySkeleton />
        ) : (
          <Library onSelectDocument={() => {}} />
        )
      )}
    </div>
  );
}
