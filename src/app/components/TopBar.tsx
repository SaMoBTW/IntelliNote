import { Settings, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from './ui/breadcrumb';

interface TopBarProps {
  breadcrumbs: { label: string; href?: string }[];
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings?: () => void;
}

export function TopBar({ breadcrumbs, darkMode, onToggleDarkMode, onOpenSettings }: TopBarProps) {
  return (
    <div className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleDarkMode}
          className="rounded-full"
        >
          {darkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          className="rounded-full"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}