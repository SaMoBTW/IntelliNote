interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'purple';
  showText?: boolean;
}

export function Logo({ size = 'md', variant = 'purple', showText = true }: LogoProps) {
  const dimensions = {
    sm: { container: 'w-8 h-10', chip: 'w-2.5 h-2.5', text: 'text-sm' },
    md: { container: 'w-10 h-12', chip: 'w-3 h-3', text: 'text-lg' },
    lg: { container: 'w-14 h-16', chip: 'w-4 h-4', text: 'text-2xl' },
  };

  const colors = {
    light: { bg: 'bg-white', chip: 'bg-primary', lines: 'bg-gray-200', border: 'border-gray-200' },
    dark: { bg: 'bg-gray-900', chip: 'bg-primary', lines: 'bg-gray-700', border: 'border-gray-700' },
    purple: { bg: 'bg-primary', chip: 'bg-white', lines: 'bg-white/30', border: 'border-primary' },
  };

  const { container, chip, text } = dimensions[size];
  const { bg, chip: chipColor, lines: lineColor, border: borderColor } = colors[variant];

  return (
    <div className="flex items-center gap-3">
      <div className={`${container} ${bg} rounded-lg ${borderColor} border-2 flex flex-col items-center justify-center relative shadow-lg`}>
        {/* Document lines */}
        <div className="w-3/5 space-y-1">
          <div className={`h-0.5 ${lineColor} rounded-full`}></div>
          <div className={`h-0.5 ${lineColor} rounded-full w-4/5`}></div>
          <div className={`h-0.5 ${lineColor} rounded-full`}></div>
        </div>

        {/* AI Chip Icon */}
        <div className={`absolute bottom-1.5 ${chip} ${chipColor} rounded flex items-center justify-center`}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={variant === 'purple' ? 'text-primary' : 'text-white'}
            style={{ width: '60%', height: '60%' }}
          >
            <rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" />
            <path d="M10 4V6M14 4V6M10 18V20M14 18V20M4 10H6M4 14H6M18 10H20M18 14H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {showText && (
        <span className={`font-semibold ${text}`}>
          <span className="text-primary">Intelli</span>
          <span className="text-sidebar-foreground">Note</span>
        </span>
      )}
    </div>
  );
}
