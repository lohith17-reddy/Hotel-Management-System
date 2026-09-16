import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface InfoTooltipProps {
  content: string | React.ReactNode;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  iconClassName?: string;
  variant?: 'info' | 'help';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  title,
  position = 'top',
  className = '',
  iconClassName = 'w-3.5 h-3.5 text-slate-400 hover:text-indigo-600',
  variant = 'info',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      case 'top':
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  return (
    <div
      className={`relative inline-flex items-center align-middle group cursor-help ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
      tabIndex={0}
      role="tooltip"
      aria-label={typeof content === 'string' ? content : title || 'Metric Information'}
      onClick={(e) => e.stopPropagation()}
    >
      {variant === 'help' ? (
        <HelpCircle className={`transition-colors shrink-0 ${iconClassName}`} />
      ) : (
        <Info className={`transition-colors shrink-0 ${iconClassName}`} />
      )}

      {isOpen && (
        <div
          className={`absolute z-50 w-64 p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700/80 text-xs pointer-events-none transform transition-all duration-200 animate-in fade-in zoom-in-95 ${getPositionClasses()}`}
        >
          {title && (
            <div className="font-bold text-indigo-300 text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              {title}
            </div>
          )}
          <div className="text-slate-200 leading-relaxed text-[11px] font-normal">
            {content}
          </div>
          {/* Arrow */}
          <div
            className={`absolute w-2 h-2 bg-slate-900 border-slate-700/80 rotate-45 ${
              position === 'bottom'
                ? '-top-1 left-1/2 -translate-x-1/2 border-t border-l'
                : position === 'left'
                ? '-right-1 top-1/2 -translate-y-1/2 border-t border-r'
                : position === 'right'
                ? '-left-1 top-1/2 -translate-y-1/2 border-b border-l'
                : '-bottom-1 left-1/2 -translate-x-1/2 border-b border-r'
            }`}
          />
        </div>
      )}
    </div>
  );
};
