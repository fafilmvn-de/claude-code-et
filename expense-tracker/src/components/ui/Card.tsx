import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  gradient?: boolean;
  style?: React.CSSProperties;
}

export function Card({ className, children, hover = true, gradient = false, style }: CardProps) {
  return (
    <div 
      className={cn(
        'relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 transition-all duration-300 animate-fade-in backdrop-blur-sm overflow-hidden',
        hover && 'hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 hover:scale-[1.02]',
        gradient && 'bg-gradient-to-br from-white via-white/95 to-gray-50 dark:from-slate-800 dark:via-slate-800/95 dark:to-slate-900',
        className
      )}
      style={style}
    >
      {gradient && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 via-transparent to-transparent rounded-full blur-2xl" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
  gradient?: boolean;
}

export function CardTitle({ className, children, gradient = false }: CardTitleProps) {
  return (
    <h3 className={cn(
      'text-xl font-bold tracking-tight',
      gradient 
        ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent' 
        : 'text-gray-900 dark:text-white',
      className
    )}>
      {children}
    </h3>
  );
}

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export function CardContent({ className, children }: CardContentProps) {
  return (
    <div className={cn('text-gray-700 dark:text-gray-200', className)}>
      {children}
    </div>
  );
}

interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export function CardDescription({ className, children }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-gray-500 dark:text-gray-400 mt-2', className)}>
      {children}
    </p>
  );
}