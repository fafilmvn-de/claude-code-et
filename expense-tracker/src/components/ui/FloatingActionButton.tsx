'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'md' | 'lg';
}

const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ className, size = 'lg', children, ...props }, ref) => {
    return (
      <button
        className={cn(
          'fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 active:scale-95 group overflow-hidden',
          {
            'w-14 h-14': size === 'md',
            'w-16 h-16': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10 flex items-center justify-center">
          {children || <Plus className="h-6 w-6" />}
        </div>
        
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-20" />
      </button>
    );
  }
);

FloatingActionButton.displayName = 'FloatingActionButton';

export { FloatingActionButton };