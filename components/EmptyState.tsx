import React from 'react';
import { Package, TrendingUp, ShoppingBag, Plus } from 'lucide-react';

interface EmptyStateProps {
  type: 'inventory' | 'dashboard' | 'sold';
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction }) => {
  const configs = {
    inventory: {
      icon: Package,
      title: 'Žádné položky',
      description: 'Začněte přidáním první položky do inventáře',
      actionLabel: 'Přidat položku',
      gradient: 'from-blue-500 to-cyan-400',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
    },
    dashboard: {
      icon: TrendingUp,
      title: 'Zatím žádné statistiky',
      description: 'Přidejte položky a sledujte své zisky',
      actionLabel: 'Přidat první položku',
      gradient: 'from-green-500 to-emerald-400',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
    },
    sold: {
      icon: ShoppingBag,
      title: 'Žádné prodeje',
      description: 'Zatím jste neprodali žádnou položku',
      actionLabel: undefined,
      gradient: 'from-purple-500 to-pink-400',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 rounded-3xl bg-gradient-to-br ${config.bgGradient} animate-fade-in-up`}>
      {/* Animated illustration */}
      <div className="relative mb-6">
        {/* Background circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${config.gradient} opacity-10 animate-pulse`} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${config.gradient} opacity-20`}
               style={{ animation: 'pulse 2s ease-in-out infinite 0.5s' }} />
        </div>

        {/* Icon container */}
        <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg animate-float`}>
          <Icon size={36} className="text-white" strokeWidth={1.5} />
        </div>

        {/* Decorative dots */}
        <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-ios-blue opacity-60 animate-bounce"
             style={{ animationDelay: '0.2s' }} />
        <div className="absolute -bottom-1 -left-3 w-2 h-2 rounded-full bg-ios-green opacity-60 animate-bounce"
             style={{ animationDelay: '0.4s' }} />
        <div className="absolute top-1/2 -right-4 w-2 h-2 rounded-full bg-ios-orange opacity-60 animate-bounce"
             style={{ animationDelay: '0.6s' }} />
      </div>

      {/* Text content */}
      <h3 className="text-xl font-bold text-ios-text dark:text-white mb-2 text-center">
        {config.title}
      </h3>
      <p className="text-ios-textSec text-center max-w-xs mb-6">
        {config.description}
      </p>

      {/* Action button */}
      {config.actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${config.gradient} text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
        >
          <Plus size={20} />
          {config.actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
