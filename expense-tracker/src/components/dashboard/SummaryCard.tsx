import { Card, CardContent } from '@/components/ui/Card';
import { LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  gradient?: string;
  iconColor?: string;
  style?: React.CSSProperties;
}

export function SummaryCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  className, 
  gradient = 'from-blue-600 to-purple-600',
  iconColor = 'text-white',
  style
}: SummaryCardProps) {
  const displayValue = typeof value === 'number' ? formatCurrency(value) : value;

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value === 0) return <Minus className="h-4 w-4" />;
    return trend.isPositive ? 
      <TrendingUp className="h-4 w-4" /> : 
      <TrendingDown className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value === 0) return 'text-gray-500 dark:text-gray-400';
    // For expenses, decreasing is good (green), increasing is concerning (red)
    return trend.isPositive ? 'text-red-500' : 'text-green-500';
  };

  return (
    <Card className={className} gradient style={style}>
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{displayValue}</p>
            
            {trend && (
              <div className={`flex items-center space-x-1 mt-3 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="text-sm font-medium">
                  {Math.abs(trend.value)}% from last month
                </span>
              </div>
            )}
          </div>
          
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-sm opacity-75`}></div>
            <div className={`relative h-14 w-14 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}>
              <Icon className={`h-7 w-7 ${iconColor}`} />
            </div>
          </div>
        </div>
        
        {/* Subtle background accent */}
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${gradient} opacity-5 rounded-full blur-2xl`}></div>
      </CardContent>
    </Card>
  );
}