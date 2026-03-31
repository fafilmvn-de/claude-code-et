import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          'relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95 hover:shadow-lg overflow-hidden group',
          {
            'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-xl': variant === 'primary',
            'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'secondary',
            'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-xl': variant === 'danger',
            'text-gray-700 hover:bg-gray-100 hover:text-gray-900': variant === 'ghost',
            'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:shadow-xl border-0': variant === 'gradient',
          },
          {
            'h-9 px-3 text-sm': size === 'sm',
            'h-11 px-6 py-3 text-base': size === 'md',
            'h-12 px-8 text-lg': size === 'lg',
          },
          className
        )}
        disabled={loading || props.disabled}
        ref={ref}
        {...props}
      >
        {variant === 'gradient' && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
        
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          <span className="relative z-10 flex items-center space-x-2">
            {children}
          </span>
        )}
        
        {/* Ripple effect */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-white/20 translate-x-full group-active:translate-x-0 transition-transform duration-300 ease-out" />
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };