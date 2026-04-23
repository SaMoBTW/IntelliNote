# Skeleton Loading States - IntelliNote

## Overview
Skeleton loading states have been implemented for the Dashboard and Library screens to provide visual feedback while content is loading.

## Files Created
- `/src/app/components/Skeleton.tsx` - Contains all skeleton components
- `/src/app/components/SkeletonDemo.tsx` - Demo component to test skeleton states

## Components

### 1. Base Skeleton Component
```tsx
<Skeleton className="h-4 w-32 rounded-md" />
```
- Uses `bg-muted` for the base color
- Includes smooth shimmer animation effect
- Fully customizable via className

### 2. DashboardSkeleton
Displays loading state for the Dashboard screen with:
- Hero card with skeleton text bars
- 4 stat cards with skeleton blocks
- Quick actions section with skeleton shapes
- 4 document card skeletons

### 3. LibrarySkeleton  
Displays loading state for the Library screen with:
- Header skeleton
- View toggle buttons skeleton
- 6 document card skeletons in grid layout

## Usage

### In Dashboard Component
```tsx
import { DashboardSkeleton } from './Skeleton';

export function Dashboard({ onNavigateToStudy, userName, isLoading }: DashboardProps) {
  if (isLoading) {
    return <DashboardSkeleton />;
  }
  
  // ... rest of component
}
```

### In Library Component
```tsx
import { LibrarySkeleton } from './Skeleton';

export function Library({ onSelectDocument, isLoading }: LibraryProps) {
  return (
    <div className="flex-1 overflow-auto">
      {isLoading ? (
        <LibrarySkeleton />
      ) : (
        // ... actual content
      )}
    </div>
  );
}
```

### Testing Skeleton States
Use the SkeletonDemo component to see the skeletons in action:

```tsx
import { SkeletonDemo } from './components/SkeletonDemo';

// In App.tsx, you can add a demo view to test
<SkeletonDemo />
```

## Design Specs

### Visual Style
- **Base Color**: Uses CSS variable `--muted` 
  - Light mode: `#f5f5f7`
  - Dark mode: `#312e81`
- **Shimmer Effect**: Diagonal gradient animation moving across skeleton shapes
- **Animation**: 2s infinite ease-in-out

### Shimmer Animation
The shimmer effect is defined in `/src/styles/theme.css`:

```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite ease-in-out;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
}
```

## Layout Matching
The skeleton states precisely match the layout of their actual content:

### Dashboard
- Hero section maintains exact height and structure
- Stats grid uses same 2-column mobile / 4-column desktop layout
- Quick actions match the dominant upload card + 2 smaller cards
- Document cards grid matches 1/2/4 column responsive layout

### Library
- Header with title and buttons
- Filter/sort bar
- Document grid matches 1/2/3/4 column responsive layout
- Each card skeleton matches actual card dimensions

## Responsive Design
All skeleton components are fully responsive and match the responsive behavior of actual content:
- Mobile: Tighter padding and smaller elements
- Desktop: Full padding and larger elements
- Uses same breakpoints as actual components (sm, md, lg, xl)

## Accessibility
- Skeleton states provide visual loading feedback
- Maintains layout to prevent content shift
- Smooth transitions when content loads

## Best Practices
1. **Always show skeletons** when fetching data from an API
2. **Match skeleton layout** to actual content for consistent UX
3. **Use appropriate delays** - typically show skeleton for minimum 300ms to avoid flashing
4. **Maintain animations** - keep animations smooth and non-distracting

## Example: Simulating Loading
```tsx
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  // Simulate data fetch
  setTimeout(() => {
    setIsLoading(false);
  }, 2000);
}, []);

return <Dashboard isLoading={isLoading} />;
```

## Future Enhancements
Potential additions:
- Skeleton states for Summary, Quizzes, and Flashcards pages
- Skeleton for individual study view
- Skeleton for settings page
- Custom skeleton for different content types
