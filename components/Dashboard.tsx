import React, { useMemo, useState } from 'react';
import { Item, DashboardStats } from '../types';
import { TrendingUp, Package, Wallet, ArrowUpRight, ArrowDownRight, Tag, Coins, Percent } from 'lucide-react';
import { AnimatedCurrency, AnimatedNumber, AnimatedPercentage } from './AnimatedCounter';
import EmptyState from './EmptyState';
import { useNavigate } from 'react-router-dom';

type ChartPeriod = '3m' | '6m' | '12m';

interface DashboardProps {
  items: Item[];
}

const COLORS = ['#34C759', '#007AFF', '#FF9500', '#FF3B30', '#AF52DE'];

const Dashboard: React.FC<DashboardProps> = ({ items }) => {
  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('6m');

  const stats = useMemo(() => {
    let profit = 0;
    let revenue = 0;
    let costs = 0;
    let sold = 0;
    let active = 0;
    let value = 0;

    items.forEach(item => {
      if (item.status === 'sold') {
        sold++;
        const salePrice = item.salePrice || 0;
        const fees = (item.fees || 0) + (item.shippingCost || 0);
        const itemProfit = salePrice - item.purchasePrice - fees;

        profit += itemProfit;
        revenue += salePrice;
        costs += item.purchasePrice + fees;
      } else {
        active++;
        value += item.purchasePrice;
      }
    });

    // Calculate ROI (Return on Investment)
    const roi = costs > 0 ? ((revenue - costs) / costs) * 100 : 0;

    return {
      totalProfit: profit,
      totalRevenue: revenue,
      totalCost: costs,
      soldCount: sold,
      activeCount: active,
      inventoryValue: value,
      averageSalePrice: sold > 0 ? revenue / sold : 0,
      averageProfit: sold > 0 ? profit / sold : 0,
      roi: roi
    };
  }, [items]);

  // Chart Data Preparation - Dynamic based on selected period
  const chartData = useMemo(() => {
    const periodMonths = chartPeriod === '3m' ? 3 : chartPeriod === '6m' ? 6 : 12;
    const months: Record<string, { name: string; zisk: number; trzby: number; naklady: number; sortKey: number }> = {};

    // Get months based on selected period
    const periodRange = Array.from({ length: periodMonths }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (periodMonths - 1 - i));
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const name = d.toLocaleString('cs-CZ', { month: 'short' });
        return { key, name, sortKey: d.getTime() };
    });

    // Initialize all months
    periodRange.forEach(m => months[m.key] = { name: m.name, zisk: 0, trzby: 0, naklady: 0, sortKey: m.sortKey });

    items.filter(i => i.status === 'sold' && i.saleDate).forEach(item => {
        const date = new Date(item.saleDate!);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (months[key]) {
            const salePrice = item.salePrice || 0;
            const fees = (item.fees || 0) + (item.shippingCost || 0);
            const cost = item.purchasePrice + fees;
            const profit = salePrice - cost;

            months[key].zisk += profit;
            months[key].trzby += salePrice;
            months[key].naklady += cost;
        }
    });

    // Return sorted by date
    return Object.values(months).sort((a, b) => a.sortKey - b.sortKey);
  }, [items, chartPeriod]);

  const platformData = useMemo(() => {
    const platforms: Record<string, number> = {};
    const soldItems = items.filter(i => i.status === 'sold');

    soldItems.forEach(item => {
        const p = item.salePlatform || 'Jiné';
        platforms[p] = (platforms[p] || 0) + 1;
    });

    const result = Object.entries(platforms)
      .map(([name, value]) => ({ name, value: Number(value) || 0 }))
      .filter(item => item.value > 0 && !isNaN(item.value));

    return result.sort((a, b) => b.value - a.value);
  }, [items]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(val);

  // Show empty state if no items
  if (items.length === 0) {
    return (
      <div className="px-5 pt-6 pb-24 text-ios-text dark:text-white">
        <EmptyState type="dashboard" onAction={() => navigate('/add')} />
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4 space-y-6 text-ios-text dark:text-white">
      {/* Main Stats Card */}
      <div className="bg-ios-card dark:bg-[#1C1C1E] rounded-2xl p-5 shadow-ios-card border border-white/50 dark:border-white/5 animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
        <div className="flex justify-between items-start mb-4">
          <div>
             <p className="text-sm font-medium text-ios-textSec uppercase tracking-wider">Celkový zisk</p>
             <h2 className="text-3xl font-bold mt-1">
               <AnimatedCurrency value={stats.totalProfit} className={stats.totalProfit >= 0 ? 'gradient-text-profit' : 'text-ios-red'} />
             </h2>
          </div>
          <div className="bg-ios-blue/10 p-2 rounded-full animate-float">
            <TrendingUp className="text-ios-blue" size={24} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
           <div>
             <div className="flex items-center text-ios-green text-xs font-semibold mb-1">
               <ArrowUpRight size={14} className="mr-1" />
               Tržby
             </div>
             <p className="text-lg font-semibold">
               <AnimatedCurrency value={stats.totalRevenue} />
             </p>
           </div>
           <div>
             <div className="flex items-center text-ios-red text-xs font-semibold mb-1">
               <ArrowDownRight size={14} className="mr-1" />
               Náklady
             </div>
             <p className="text-lg font-semibold">
               <AnimatedCurrency value={stats.totalCost} />
             </p>
           </div>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Inventory */}
        <div className="bg-ios-card dark:bg-[#1C1C1E] p-4 rounded-2xl shadow-ios-card border border-transparent dark:border-white/5 animate-fade-in-up opacity-0" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
           <div className="flex items-center space-x-2 mb-2 text-ios-textSec">
              <Package size={18} />
              <span className="text-xs font-medium uppercase">Inventář</span>
           </div>
           <p className="text-2xl font-bold">
             <AnimatedNumber value={stats.activeCount} /> <span className="text-sm font-normal text-ios-textSec">ks</span>
           </p>
           <p className="text-xs text-ios-textSec mt-1">Hodnota: <AnimatedCurrency value={stats.inventoryValue} duration={800} /></p>
        </div>

        {/* Sold */}
        <div className="bg-ios-card dark:bg-[#1C1C1E] p-4 rounded-2xl shadow-ios-card border border-transparent dark:border-white/5 animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
           <div className="flex items-center space-x-2 mb-2 text-ios-textSec">
              <Wallet size={18} />
              <span className="text-xs font-medium uppercase">Prodáno</span>
           </div>
           <p className="text-2xl font-bold">
             <AnimatedNumber value={stats.soldCount} /> <span className="text-sm font-normal text-ios-textSec">ks</span>
           </p>
           <p className="text-xs text-ios-textSec mt-1">
             Úspěšnost: <AnimatedPercentage value={stats.soldCount + stats.activeCount > 0 ? Math.round((stats.soldCount / (stats.soldCount + stats.activeCount)) * 100) : 0} />
           </p>
        </div>

        {/* Average Price */}
        <div className="bg-ios-card dark:bg-[#1C1C1E] p-4 rounded-2xl shadow-ios-card border border-transparent dark:border-white/5 animate-fade-in-up opacity-0" style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}>
           <div className="flex items-center space-x-2 mb-2 text-ios-textSec">
              <Tag size={18} />
              <span className="text-xs font-medium uppercase">Prům. cena</span>
           </div>
           <p className="text-2xl font-bold">
             <AnimatedCurrency value={stats.averageSalePrice} />
           </p>
           <p className="text-xs text-ios-textSec mt-1">za prodaný kus</p>
        </div>

        {/* Average Profit */}
        <div className="bg-ios-card dark:bg-[#1C1C1E] p-4 rounded-2xl shadow-ios-card border border-transparent dark:border-white/5 animate-fade-in-up opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
           <div className="flex items-center space-x-2 mb-2 text-ios-textSec">
              <Coins size={18} />
              <span className="text-xs font-medium uppercase">Prům. zisk</span>
           </div>
           <p className="text-2xl font-bold">
             <AnimatedCurrency
               value={stats.averageProfit}
               className={stats.averageProfit > 0 ? 'text-ios-green' : stats.averageProfit < 0 ? 'text-ios-red' : ''}
             />
           </p>
           <p className="text-xs text-ios-textSec mt-1">za prodaný kus</p>
        </div>
      </div>

      {/* ROI Card - Full Width */}
      <div className="bg-gradient-to-br from-violet-700 via-purple-800 to-indigo-900 p-5 rounded-2xl shadow-xl shadow-purple-900/30 animate-fade-in-up opacity-0 border border-purple-500/20" style={{ animationDelay: '0.32s', animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2 text-purple-200">
              <Percent size={18} />
              <span className="text-xs font-medium uppercase tracking-wider">Návratnost investice (ROI)</span>
            </div>
            <p className="text-3xl font-bold text-white drop-shadow-lg">
              <AnimatedPercentage value={Math.round(stats.roi)} />
            </p>
            <p className="text-xs text-purple-200/80 mt-1">
              {stats.roi > 0 ? 'Výborná návratnost!' : stats.roi === 0 ? 'Žádné prodeje' : 'Ztrátové období'}
            </p>
          </div>
          <div className="bg-purple-500/30 p-3 rounded-full animate-float border border-purple-400/30">
            <TrendingUp className="text-purple-200" size={28} />
          </div>
        </div>
      </div>

      {/* Financial Chart */}
      <div className="bg-ios-card dark:bg-[#1C1C1E] p-5 rounded-2xl shadow-ios-card border border-transparent dark:border-white/5 animate-fade-in-up opacity-0" style={{ animationDelay: '0.35s', animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Finanční bilance</h3>
            {/* Period Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              {(['3m', '6m', '12m'] as ChartPeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all duration-200 ${
                    chartPeriod === period
                      ? 'bg-white dark:bg-[#2C2C2E] text-ios-blue shadow-sm'
                      : 'text-ios-textSec hover:text-ios-text'
                  }`}
                >
                  {period === '3m' ? '3M' : period === '6m' ? '6M' : '1R'}
                </button>
              ))}
            </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-semibold uppercase mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-600"></div>
              <span className="text-ios-textSec">Tržby</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-ios-blue"></div>
              <span className="text-ios-textSec">Zisk</span>
            </div>
        </div>

        {chartData.length > 0 ? (
          <div className="space-y-3">
            {chartData.map((month, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-ios-text dark:text-white w-10">{month.name}</span>
                  <span className="text-ios-textSec text-[10px]">
                    {formatCurrency(month.trzby)} / <span className={month.zisk >= 0 ? 'text-ios-green' : 'text-ios-red'}>{formatCurrency(month.zisk)}</span>
                  </span>
                </div>
                <div className="relative h-6 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  {/* Revenue bar (background) */}
                  <div
                    className="absolute inset-y-0 left-0 bg-gray-200 dark:bg-gray-600 rounded-lg transition-all duration-500"
                    style={{ width: `${Math.min((month.trzby / Math.max(...chartData.map(m => m.trzby))) * 100, 100)}%` }}
                  />
                  {/* Profit bar (foreground) */}
                  <div
                    className={`absolute inset-y-0 left-0 rounded-lg transition-all duration-500 ${month.zisk >= 0 ? 'bg-ios-blue' : 'bg-ios-red'}`}
                    style={{ width: `${Math.min((Math.abs(month.zisk) / Math.max(...chartData.map(m => m.trzby))) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ios-textSec text-sm text-center py-8">Žádná data k zobrazení</p>
        )}
      </div>

      {/* Platform Stats */}
      <div className="bg-ios-card dark:bg-[#1C1C1E] p-5 rounded-2xl shadow-ios-card mb-20 border border-transparent dark:border-white/5 animate-fade-in-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          <h3 className="text-lg font-bold mb-4">Platformy</h3>
          {platformData.length > 0 ? (
            <div className="space-y-3">
              {platformData.map((item, index) => {
                const maxValue = Math.max(...platformData.map(p => p.value));
                const percentage = (item.value / maxValue) * 100;
                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-ios-text dark:text-white">{item.name}</span>
                      <span className="text-ios-textSec font-semibold">{item.value} ks</span>
                    </div>
                    <div className="relative h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-ios-textSec text-sm text-center py-8">Žádné prodeje k zobrazení</p>
          )}
      </div>
    </div>
  );
};

export default Dashboard;
