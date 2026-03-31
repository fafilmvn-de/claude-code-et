'use client';

import { useMemo } from 'react';
import { Expense } from '@/types/expense';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Calendar,
  Lightbulb,
  Star
} from 'lucide-react';

interface SpendingInsightsProps {
  expenses: Expense[];
}

interface Insight {
  type: 'trend' | 'warning' | 'achievement' | 'tip';
  title: string;
  message: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
}

export function SpendingInsights({ expenses }: SpendingInsightsProps) {
  const insights = useMemo(() => {
    const insights: Insight[] = [];
    
    if (expenses.length === 0) return insights;

    // Calculate time periods
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const thisMonthExpenses = expenses.filter(expense => {
      const date = new Date(expense.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const lastMonthExpenses = expenses.filter(expense => {
      const date = new Date(expense.date);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Category analysis
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryTotals).reduce(
      (max, [category, amount]) => amount > max.amount ? { category, amount } : max,
      { category: '', amount: 0 }
    );

    // Monthly trend insights
    if (lastMonthTotal > 0) {
      const change = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
      
      if (change > 20) {
        insights.push({
          type: 'warning',
          title: 'Spending Alert',
          message: `Your spending increased by ${Math.round(change)}% this month. Consider reviewing your recent expenses.`,
          icon: AlertTriangle,
          color: 'text-orange-600',
          gradient: 'from-orange-500 to-red-500'
        });
      } else if (change < -10) {
        insights.push({
          type: 'achievement',
          title: 'Great Progress!',
          message: `You reduced spending by ${Math.abs(Math.round(change))}% this month. Keep it up!`,
          icon: Star,
          color: 'text-green-600',
          gradient: 'from-green-500 to-emerald-500'
        });
      }
    }

    // Category insights
    if (topCategory.category && topCategory.amount > 0) {
      const percentage = (topCategory.amount / expenses.reduce((sum, e) => sum + e.amount, 0)) * 100;
      if (percentage > 40) {
        insights.push({
          type: 'trend',
          title: 'Category Focus',
          message: `${topCategory.category} makes up ${Math.round(percentage)}% of your spending. Consider if this aligns with your priorities.`,
          icon: Target,
          color: 'text-blue-600',
          gradient: 'from-blue-500 to-cyan-500'
        });
      }
    }

    // Weekly pattern insight
    const recentExpenses = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        const daysDiff = Math.floor((now.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7;
      });

    if (recentExpenses.length >= 3) {
      const weeklyTotal = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      insights.push({
        type: 'trend',
        title: 'Weekly Activity',
        message: `You've made ${recentExpenses.length} purchases totaling ${formatCurrency(weeklyTotal)} in the past week.`,
        icon: Calendar,
        color: 'text-purple-600',
        gradient: 'from-purple-500 to-pink-500'
      });
    }

    // Smart tips
    const averageExpense = expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length;
    
    if (expenses.length > 10) {
      insights.push({
        type: 'tip',
        title: 'Smart Tip',
        message: `Your average expense is ${formatCurrency(averageExpense)}. Consider setting spending alerts for amounts above this.`,
        icon: Lightbulb,
        color: 'text-amber-600',
        gradient: 'from-amber-500 to-orange-500'
      });
    }

    return insights;
  }, [expenses]);

  if (insights.length === 0) {
    return null;
  }

  const getInsightIcon = (insight: Insight) => {
    switch (insight.type) {
      case 'trend':
        return <TrendingUp className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'achievement':
        return <Star className="h-5 w-5" />;
      case 'tip':
        return <Lightbulb className="h-5 w-5" />;
      default:
        return <insight.icon className="h-5 w-5" />;
    }
  };

  return (
    <Card gradient className="animate-fade-in">
      <CardHeader>
        <CardTitle gradient className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6" />
          <span>Smart Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group"
            >
              <div className={`p-3 rounded-xl bg-gradient-to-r ${insight.gradient} shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}>
                <div className="text-white">
                  {getInsightIcon(insight)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold ${insight.color} mb-1`}>
                  {insight.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {insight.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}