import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../utils/helpers';

interface NavItem {
  id: any;
  label: string;
  icon: LucideIcon;
}

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  activeView: string;
  onViewChange: (view: any) => void;
  navItems: NavItem[];
  actions?: React.ReactNode;
}

export function Layout({ children, title, activeView, onViewChange, navItems, actions }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-emerald-900 text-white p-4 pt-6 shadow-xl z-10 shrink-0">
        <div className="flex justify-between items-center max-w-lg mx-auto w-full">
          <div>
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
            <p className="text-emerald-300 text-[10px] font-medium uppercase tracking-widest leading-none">ನಮ್ಮ ಸಂತೆ ಲೆಡ್ಜರ್</p>
          </div>
          {actions}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full max-w-lg mx-auto pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-4 px-6 space-y-6"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-20">
        <div className="flex justify-around items-center max-w-lg mx-auto py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2 min-w-[80px] transition-all relative font-bold",
                  isActive ? "text-emerald-700" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <div className={cn(
                  "w-12 h-7 rounded-full flex items-center justify-center transition-colors",
                  isActive ? "bg-emerald-100" : "bg-transparent"
                )}>
                  <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                </div>
                <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
