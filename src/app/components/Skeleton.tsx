import { Card } from './ui/card';
import { motion } from 'motion/react';

// Base Skeleton Component
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`relative bg-muted overflow-hidden ${className}`}
    >
      <div 
        className="absolute inset-0 animate-shimmer"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
      />
    </div>
  );
}

// Dashboard Loading State
export function DashboardSkeleton() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto p-3 lg:p-8 pb-20 lg:pb-8 space-y-4 lg:space-y-8">
        {/* Hero Section Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden"
        >
          <Card className="border-0 bg-gradient-to-br from-primary via-primary/90 to-indigo-900 relative overflow-hidden shadow-xl">
            <div className="relative p-5 lg:p-12">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  {/* Welcome Badge */}
                  <Skeleton className="h-4 w-32 lg:w-40 rounded-full" />
                  
                  {/* Greeting */}
                  <Skeleton className="h-8 lg:h-12 w-48 lg:w-72 rounded-lg" />
                  
                  {/* Daily Tip */}
                  <Skeleton className="h-4 lg:h-6 w-full max-w-md rounded-lg" />
                  <Skeleton className="h-4 lg:h-6 w-3/4 max-w-sm rounded-lg" />
                  
                  {/* Status Indicators */}
                  <div className="flex flex-wrap items-center gap-3 lg:gap-6 pt-2">
                    <Skeleton className="h-3 w-24 rounded-full" />
                    <Skeleton className="h-3 w-24 rounded-full" />
                  </div>
                </div>
                
                {/* Icon on desktop */}
                <div className="hidden lg:block">
                  <Skeleton className="w-32 h-32 rounded-3xl" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
        >
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-3 lg:p-4 border border-border dark:border-white/10 rounded-2xl">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
                <Skeleton className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg" />
                <Skeleton className="w-12 h-8 rounded-md" />
              </div>
              <Skeleton className="h-3 w-20 rounded-md" />
            </Card>
          ))}
        </motion.div>

        {/* Quick Actions Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Skeleton className="h-6 lg:h-7 w-32 mb-3 lg:mb-4 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
            {/* Upload Card Skeleton */}
            <Card className="md:col-span-2 p-5 lg:p-8 border-2 border-border dark:border-white/10 rounded-2xl">
              <div className="flex items-start gap-4 lg:gap-6">
                <Skeleton className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 lg:h-6 w-40 rounded-lg" />
                  <Skeleton className="h-3 lg:h-4 w-full rounded-md" />
                  <Skeleton className="h-3 lg:h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
              </div>
            </Card>

            {/* Other Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-3 lg:gap-4">
              <Card className="p-4 lg:p-6 border border-border dark:border-white/10 rounded-2xl">
                <div className="flex flex-col md:flex-row items-start gap-3 lg:gap-4">
                  <Skeleton className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 lg:p-6 border border-border dark:border-white/10 rounded-2xl">
                <div className="flex flex-col md:flex-row items-start gap-3 lg:gap-4">
                  <Skeleton className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Continue Learning Skeleton */}
        <div>
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div className="space-y-2">
              <Skeleton className="h-6 lg:h-8 w-40 rounded-lg" />
              <Skeleton className="h-3 w-48 rounded-md" />
            </div>
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>

          {/* Document Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.05 }}
              >
                <Card className="overflow-hidden rounded-2xl border border-border dark:border-white/10">
                  {/* Thumbnail Area */}
                  <Skeleton className="h-28 lg:h-32 rounded-none" />
                  
                  {/* Content */}
                  <div className="p-3 lg:p-4 space-y-3">
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                    <Skeleton className="h-3 w-24 rounded-md" />
                    <div className="space-y-2">
                      <Skeleton className="h-1.5 w-full rounded-full" />
                      <Skeleton className="h-3 w-20 rounded-md" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Library Loading State
export function LibrarySkeleton() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-4 lg:p-8 pb-20 lg:pb-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 lg:h-10 w-32 rounded-lg" />
            <Skeleton className="h-4 w-56 rounded-md" />
          </div>

          {/* View Toggle and Add Button */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <Skeleton className="w-10 h-10 rounded-lg" />
            </div>
            <Skeleton className="w-32 h-10 rounded-lg" />
          </div>
        </div>

        {/* Filter/Sort Bar Skeleton */}
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
          <div className="flex-1" />
          <Skeleton className="h-10 w-40 rounded-lg hidden md:block" />
        </div>

        {/* Documents Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Card className="overflow-hidden rounded-2xl border border-border dark:border-white/10">
                {/* Thumbnail */}
                <Skeleton className="h-40 lg:h-48 rounded-none" />
                
                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Title */}
                  <Skeleton className="h-5 w-full rounded-md" />
                  <Skeleton className="h-5 w-2/3 rounded-md" />
                  
                  {/* Metadata */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}