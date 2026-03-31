import { 
  UtensilsCrossed, 
  Car, 
  Gamepad2, 
  ShoppingBag, 
  Receipt, 
  DollarSign,
  HelpCircle,
  LucideIcon
} from 'lucide-react';
import { ExpenseCategory } from '@/types/expense';

export interface CategoryConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  gradient: string;
  description: string;
}

export const CATEGORY_ICONS: Record<ExpenseCategory, CategoryConfig> = {
  Food: {
    icon: UtensilsCrossed,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    gradient: 'from-orange-500 to-red-500',
    description: 'Restaurants, groceries, and dining'
  },
  Transportation: {
    icon: Car,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Gas, public transit, and travel'
  },
  Entertainment: {
    icon: Gamepad2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    gradient: 'from-purple-500 to-pink-500',
    description: 'Movies, games, and fun activities'
  },
  Shopping: {
    icon: ShoppingBag,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    gradient: 'from-pink-500 to-rose-500',
    description: 'Clothes, electronics, and retail'
  },
  Bills: {
    icon: Receipt,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    gradient: 'from-red-500 to-orange-500',
    description: 'Utilities, rent, and subscriptions'
  },
  Finance: {
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    gradient: 'from-green-500 to-emerald-500',
    description: 'Investments, banking, and financial services'
  },
  Other: {
    icon: HelpCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    gradient: 'from-gray-500 to-slate-500',
    description: 'Miscellaneous expenses'
  }
};

export function getCategoryIcon(category: ExpenseCategory) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.Other;
}

export function CategoryIcon({ 
  category, 
  size = 'md',
  variant = 'default' 
}: { 
  category: ExpenseCategory;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'outline';
}) {
  const config = getCategoryIcon(category);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  if (variant === 'gradient') {
    return (
      <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br ${config.gradient} p-2 shadow-lg flex items-center justify-center`}>
        <Icon className={`${iconSizes[size]} text-white`} />
      </div>
    );
  }

  if (variant === 'outline') {
    return (
      <div className={`${sizeClasses[size]} rounded-xl border-2 border-current ${config.color} p-2 flex items-center justify-center hover:bg-current hover:bg-opacity-10 transition-colors`}>
        <Icon className={`${iconSizes[size]} ${config.color}`} />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-xl ${config.bgColor} ${config.color} p-2 flex items-center justify-center transition-all hover:scale-105`}>
      <Icon className={`${iconSizes[size]}`} />
    </div>
  );
}