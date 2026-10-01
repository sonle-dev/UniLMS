import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items, onNavigate }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-textSec mb-4 py-2 border-b border-borderLight/60">
      <button 
        onClick={() => onNavigate && onNavigate('dashboard')}
        className="flex items-center gap-1 hover:text-primary-600 transition-colors font-medium"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Trang chủ</span>
      </button>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-textMuted flex-shrink-0" />
            {isLast ? (
              <span className="font-semibold text-textMain truncate max-w-[200px] sm:max-w-[300px]">
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => item.target && onNavigate && onNavigate(item.target)}
                className="hover:text-primary-600 transition-colors font-medium truncate max-w-[150px]"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
