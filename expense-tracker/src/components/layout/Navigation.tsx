'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, List, Plus, Menu, X, TrendingUp } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Expenses', href: '/expenses', icon: List, gradient: 'from-purple-500 to-pink-500' },
  { name: 'Add Expense', href: '/add-expense', icon: Plus, gradient: 'from-green-500 to-emerald-500' },
];

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const NavigationContent = () => (
    <div className="space-y-3">
      <div className="px-4 mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <TrendingUp className="h-4 w-4" />
          <span className="font-medium">Financial Control</span>
        </div>
      </div>
      
      {navigation.map((item, index) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <div
            key={item.name}
            className={cn(
              "animate-fade-in transform transition-all duration-300",
              mounted && `animate-slide-in-left`
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Link
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'group relative flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
                isActive
                  ? 'bg-blue-600 text-white shadow-lg transform scale-[1.02]'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              {isActive && (
                <div className={cn(
                  'absolute inset-0 rounded-xl bg-gradient-to-r opacity-90',
                  item.gradient
                )} />
              )}
              
              <div className="relative flex items-center space-x-3">
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-300",
                  isActive 
                    ? "bg-white/20" 
                    : "group-hover:bg-accent"
                )}>
                  <Icon className={cn(
                    "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                    isActive && "text-white"
                  )} />
                </div>
                <span className={cn(
                  "transition-colors duration-300",
                  isActive && "text-white font-semibold"
                )}>
                  {item.name}
                </span>
              </div>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </Link>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 hover:scale-105 transition-all duration-300"
        >
          <Menu className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex animate-fade-in">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm animate-slide-in-left">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/20 transition-colors duration-300"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-8 pb-4 overflow-y-auto">
              <div className="px-4">
                <NavigationContent />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop navigation */}
      <nav className="hidden lg:block bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-r border-gray-200 dark:border-slate-700 min-h-screen w-64 p-6 transition-colors duration-300">
        <NavigationContent />
      </nav>
    </>
  );
}