import React, { useMemo } from 'react';
import { Item, DashboardStats } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { TrendingUp, Package, Wallet, ArrowUpRight, ArrowDownRight, Tag, Coins } from 'lucide-react';

interface DashboardProps {
  items: Item[];
}

const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE'];

const Dashboard: React.FC<DashboardProps> = ({ items }) => {

  const stats: DashboardStats = useMemo(() => {
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

    return {
      totalProfit: profit,
      totalRevenue: revenue,
      totalCost: costs,
      soldCount: sold,
      activeCount: active,
      inventoryValue: value,
      averageSalePrice: sold > 0 ? revenue / sold : 0,
      averageProfit: sold > 0 ? profit / sold : 0
    };
  }, [items]);

  // Chart Data Preparation - Show last 12 months with year-aware matching
  const chartData = useMemo(() => {
    const months: Record<string, { name: string; zisk: number; trzby: number; naklady: number; sortKey: number }> = {};

    // Get last 12 months with year for proper matching
    const last12Months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (11 - i));
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const name = d.toLocaleString('cs-CZ', { month: 'short' });
        return { key, name, sortKey: d.getTime() };
    });

    // Initialize all months
    last12Months.forEach(m => months[m.key] = { name: m.name, zisk: 0, trzby: 0, naklady: 0, sortKey: m.sortKey });

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

    // Return sorted by date, only months with data or last 6
    const allMonths = Object.values(months).sort((a, b) => a.sortKey - b.sortKey);
    const monthsWithData = allMonths.filter(m => m.trzby > 0);

    // Show months with data, or last 6 if no data
    return monthsWithData.length > 0 ? monthsWithData.slice(-6) : allMonths.slice(-6);
  }, [items]);

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

  return (
    <div className="px-5 pt-8 pb-4 space-y-6 animate-fade-in text-ios-text dark:text-white">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Přehled</h1>
        <p className="text-ios-textSec text-sm mt-1">Vaše obchodní výsledky</p>
      </header>

      {/* Main Stats Card */}
      <div className="bg-ios-card dark:bg-[#1C1C1E] rounded-2xl p-5 shadow-ios-card border border-white/50 dark:border-white/5">
        <div className="flex justify-between items-start mb-4">
          <div>
             <p className="text-sm font-medium text-ios-textSec uppercase tracking-wider">Celkový zisk</p>
             <h2 className="text-3xl font-bold mt-1">{formatCurrency(stats.totalProfit)}</h2>
          </div>
          <div className="bg-ios-blue/10 p-2 rounded-full">
            <TrendingUp className="text-ios-blue" size={24} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
           <div>
             <div className="flex items-center text-ios-green text-xs font-semibold mb-1">
               <ArrowUpRight size={14} className="mr-1" />
               Tržby
             </div>
             <p className="text-lg font-semibold">{formatCurrency(stats.totalRevenue)}</p>
           </div>
           <div>
             <div className="flex items-center text-ios-red text-xs font-semibold mb-1">
               <ArrowDownRight size={14} className="mr-1" />
               Náklady
             </div>
             <p className="text-lg font-semibold">{formatCurrency(stats.totalCost)}</p>
           </div>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Inventory */}
        <div className="bg-ios-card dark:bg-[#1C1C1E] p-4 rounded-2xl shadow-ios-card border border-transparent dark:border-white/5">
           <div className="flex items-center space-x-2 mb-2 text-ios-textSec">
              <Package size={18} />
              <span className="text-xs font-medium uppercase">Inventář</span>
           </div>
           <p className="text-2xl font-bold">{stats.activeCount} <span className="text-sm font-normal text-ios-textSec">ks</span></p>
           <p className="text-xs text-ios-textSec mt-1">Hodnota: {formatCurrency(stats.inventoryValue)}</p>
        </div>

        {/* Sold */}
        <div className="bg-ios-card dark:bg-[#1C1C1E] p-4 rounded-2xl shadow-ios-card border border-transparent dark:border-white/5">
           <div className="flex items-center space-x-2 mb-2 text-ios-textSec">
              <Wallet size={18} />
              <span className="text-xs font-medium uppercase">Prodáno</span>
           </div>
           <p className="text-2xl font-bold">{stats.soldCount} <span className="text-sm font-normal text-ios-textSec">ks</span></p>
           <p className="text-xs text-ios-textSec mt-1">Úspěšnost: {stats.soldCount + stats.activeCount > 0 ? Math.round((stats.soldCount / (stats.soldCount + stats.activeCount)) * 100) : 0}%</p>
        </div>

        {/* Average Price */}
        <div className="bg-ios-card dark:bg-[#1C1C1E] p-4 rounded-2xl shadow-ios-card border border-transparent dark:border-white/5">
           <div className="flex items-center space-x-2 mb-2 text-ios-textSec">
              <Tag size={18} />
              <span className="text-xs font-medium uppercase">Prům. cena</span>
           </div>
           <p className="text-2xl font-bold">{formatCurrency(stats.averageSalePrice)}</p>
           <p className="text-xs text-ios-textSec mt-1">za prodaný kus</p>
        </div>

        {/* Average Profit */}
        <div className="bg-ios-card dark:bg-[#1C1C1E] p-4 rounded-2xl shadow-ios-card border border-transparent dark:border-white/5">
           <div className="flex items-center space-x-2 mb-2 text-ios-textSec">
              <Coins size={18} />
              <span className="text-xs font-medium uppercase">Prům. zisk</span>
           </div>
           <p className={`text-2xl font-bold ${stats.averageProfit > 0 ? 'text-ios-green' : stats.averageProfit < 0 ? 'text-ios-red' : ''}`}>
             {formatCurrency(stats.averageProfit)}
           </p>
           <p className="text-xs text-ios-textSec mt-1">za prodaný kus</p>
        </div>
      </div>

      {/* Chart - Candle/Bar Style with More Info */}
      <div className="bg-ios-card dark:bg-[#1C1C1E] p-5 rounded-2xl shadow-ios-card border border-transparent dark:border-white/5">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Finanční bilance</h3>
            <div className="flex items-center gap-3 text-[10px] font-medium uppercase text-ios-textSec">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-ios-gray dark:bg-gray-600"></div>Tržby</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-ios-blue"></div>Zisk</div>
            </div>
        </div>

        <div className="w-full" style={{ height: 240 }}>
          <BarChart width={340} height={240} data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" strokeOpacity={0.5} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8E8E93', fontSize: 11 }}
              interval={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8E8E93', fontSize: 10 }}
              tickFormatter={(val) => Math.round(val/1000) + 'k'}
              width={40}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                  `${Math.round(value).toLocaleString('cs-CZ')} Kč`,
                  name === 'zisk' ? 'Čistý zisk' : 'Celkové tržby'
              ]}
            />
            <Bar dataKey="trzby" fill="#E5E5EA" />
            <Bar dataKey="zisk" fill="#007AFF" />
          </BarChart>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-ios-card dark:bg-[#1C1C1E] p-5 rounded-2xl shadow-ios-card mb-20 border border-transparent dark:border-white/5">
          <h3 className="text-lg font-bold mb-4">Platformy</h3>
          {platformData.length > 0 ? (
            <div className="flex items-center justify-around py-4">
              {platformData.map((item, index) => (
                <div key={item.name} className="flex flex-col items-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  >
                    {item.value}
                  </div>
                  <span className="text-xs text-ios-textSec">{item.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-ios-textSec text-sm text-center py-8">Žádné prodeje k zobrazení</p>
          )}
      </div>
    </div>
  );
};

export default Dashboard;
