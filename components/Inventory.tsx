import React, { useState, useRef } from 'react';
import { Item, ItemCategory } from '../types';
import { Search, Filter, Tag, ArrowUpDown, ImageOff, Snowflake, Shirt, Footprints, Layers, Package, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from './EmptyState';
import QuickSaleModal from './QuickSaleModal';
import { saveItem } from '../services/storage';
import { useToast } from './Toast';

interface InventoryProps {
  items: Item[];
}

type SortOption = 'date_newest' | 'date_oldest' | 'profit' | 'price';

// Custom Pants Icon component to replace Scissors
const PantsIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 22V12L5 3H19L20 12V22" />
    <path d="M4 12H20" />
    <path d="M12 12V22" />
  </svg>
);

// Category Configuration with Design Elements
const CATEGORIES: { id: ItemCategory | 'all'; label: string; icon: any; color: string; lightBg: string; iconColor: string }[] = [
  { id: 'all', label: 'Vše', icon: Filter, color: 'bg-gradient-to-tr from-red-600 to-orange-500', lightBg: 'bg-red-50 dark:bg-red-900/20', iconColor: 'text-red-500 dark:text-red-400' },
  { id: 'overalls', label: 'Kombinézy', icon: Snowflake, color: 'bg-gradient-to-tr from-blue-500 to-cyan-400', lightBg: 'bg-blue-50 dark:bg-blue-900/30', iconColor: 'text-blue-500' },
  { id: 'jackets', label: 'Bundy', icon: Shirt, color: 'bg-gradient-to-tr from-orange-500 to-red-500', lightBg: 'bg-orange-50 dark:bg-orange-900/30', iconColor: 'text-orange-500' },
  { id: 'softshell', label: 'Softshell', icon: Layers, color: 'bg-gradient-to-tr from-emerald-500 to-green-400', lightBg: 'bg-emerald-50 dark:bg-emerald-900/30', iconColor: 'text-emerald-500' },
  { id: 'pants', label: 'Kalhoty', icon: PantsIcon, color: 'bg-gradient-to-tr from-violet-500 to-purple-500', lightBg: 'bg-violet-50 dark:bg-violet-900/30', iconColor: 'text-violet-500' },
  { id: 'shoes', label: 'Boty', icon: Footprints, color: 'bg-gradient-to-tr from-amber-500 to-yellow-400', lightBg: 'bg-amber-50 dark:bg-amber-900/30', iconColor: 'text-amber-500' },
  { id: 'accessories', label: 'Doplňky', icon: Tag, color: 'bg-gradient-to-tr from-pink-500 to-rose-400', lightBg: 'bg-pink-50 dark:bg-pink-900/30', iconColor: 'text-pink-500' },
  { id: 'other', label: 'Ostatní', icon: Package, color: 'bg-gradient-to-tr from-indigo-500 to-blue-600', lightBg: 'bg-indigo-50 dark:bg-indigo-900/30', iconColor: 'text-indigo-500 dark:text-indigo-400' },
];

// --- Sub-component for individual cards to handle swipe state ---
const InventoryCard: React.FC<{
  item: Item;
  navigate: (path: string) => void;
  formatCurrency: (v: number) => string;
  onQuickSale?: (item: Item) => void;
}> = ({ item, navigate, formatCurrency, onQuickSale }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const images = item.images && item.images.length > 0 ? item.images : [];
  const hasMultipleImages = images.length > 1;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchEndX.current === null) {
        // If it was just a tap (no move), navigate
        if (!hasMultipleImages || Math.abs((touchStartX.current || 0) - (e.changedTouches[0].clientX)) < 10) {
            navigate(`/edit/${item.id}`);
        }
        touchStartX.current = null;
        touchEndX.current = null;
        return;
    }

    const distance = touchStartX.current - touchEndX.current;
    const isSwipe = Math.abs(distance) > 50; // Threshold for swipe

    if (isSwipe && hasMultipleImages) {
      e.stopPropagation(); // Prevent navigation
      if (distance > 0) {
        // Swipe Left -> Next Image
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      } else {
        // Swipe Right -> Prev Image
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    } else {
       // Treat as click if movement was small
       navigate(`/edit/${item.id}`);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const profit = item.status === 'sold' && item.salePrice
    ? item.salePrice - item.purchasePrice - (item.fees || 0) - (item.shippingCost || 0)
    : null;

  return (
    <div
      className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden shadow-ios-card active:scale-[0.98] transition-transform duration-200 cursor-pointer flex flex-col h-full select-none border border-transparent dark:border-white/5"
    >
      {/* Image Container with Swipe Handlers */}
      <div
        className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => navigate(`/edit/${item.id}`)}
      >
        {images.length > 0 ? (
            <img
            key={currentImageIndex}
            src={images[currentImageIndex]}
            alt={item.name}
            className="w-full h-full object-cover animate-fade-in"
            loading="lazy"
            onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('bg-gray-200');
                const fallback = document.createElement('div');
                fallback.className = 'text-gray-400 flex flex-col items-center';
                fallback.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M21 21L3 3"></path></svg>';
                e.currentTarget.parentElement?.appendChild(fallback);
            }}
            />
        ) : (
            <ImageOff className="text-gray-300 dark:text-gray-600" />
        )}

        {item.status === 'sold' && (
          <div className="absolute top-2 right-2 bg-ios-green/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide shadow-sm z-10 pointer-events-none">
            Prodáno
          </div>
        )}

        {/* Category Badge */}
        {item.category && item.category !== 'other' && (
           <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide z-10 pointer-events-none">
              {CATEGORIES.find(c => c.id === item.category)?.label}
           </div>
        )}

        {/* Pagination Dots */}
        {hasMultipleImages && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1.5 z-10 pointer-events-none">
                {images.map((_, idx) => (
                    <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all duration-300 ${
                            idx === currentImageIndex
                            ? 'bg-white scale-110'
                            : 'bg-white/50'
                        }`}
                    />
                ))}
            </div>
        )}
      </div>

      {/* Content Area */}
      <div
        className="p-3 flex-1 flex flex-col justify-between"
        onClick={(e) => {
            e.stopPropagation();
            navigate(`/edit/${item.id}`);
        }}
      >
        <div>
          <h3 className="text-sm font-semibold text-ios-text dark:text-white line-clamp-2">{item.name}</h3>
        </div>
        <div className="flex justify-between items-end mt-2">
          <div>
            <p className="text-xs text-ios-textSec">Nákup</p>
            <p className="text-sm font-medium text-ios-text dark:text-gray-200">{formatCurrency(item.purchasePrice)}</p>
          </div>
          {item.status === 'sold' ? (
             <div className="text-right">
               <p className="text-xs text-ios-textSec">Zisk</p>
               <p className={`text-sm font-bold ${profit && profit > 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                 {profit && profit > 0 ? '+' : ''}{formatCurrency(profit || 0)}
               </p>
             </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickSale?.(item);
              }}
              className="bg-ios-green/10 dark:bg-ios-green/20 p-2 rounded-full hover:bg-ios-green/20 dark:hover:bg-ios-green/30 transition-colors active:scale-95"
              title="Rychlý prodej"
            >
               <ShoppingBag size={14} className="text-ios-green" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


const Inventory: React.FC<InventoryProps> = ({ items }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [filter, setFilter] = useState<'all' | 'active' | 'sold'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('date_newest');

  // Quick Sale Modal state
  const [quickSaleItem, setQuickSaleItem] = useState<Item | null>(null);
  const [isQuickSaleOpen, setIsQuickSaleOpen] = useState(false);

  const handleQuickSale = (item: Item) => {
    setQuickSaleItem(item);
    setIsQuickSaleOpen(true);
  };

  const handleQuickSaleSave = async (item: Item) => {
    try {
      await saveItem(item);
      toast.success(`${item.name} označeno jako prodané`);
    } catch (error) {
      toast.error('Nepodařilo se uložit prodej');
    }
  };

  const filteredItems = items
    .filter(item => {
      // 1. Status Filter
      if (filter === 'active' && item.status !== 'active') return false;
      if (filter === 'sold' && item.status !== 'sold') return false;

      // 2. Category Filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

      // 3. Search Filter
      const searchLower = search.toLowerCase();
      const matchesName = item.name.toLowerCase().includes(searchLower);
      // Map category ID to label for searching
      const catLabel = CATEGORIES.find(c => c.id === item.category)?.label.toLowerCase() || '';
      const matchesCategory = catLabel.includes(searchLower);

      return matchesName || matchesCategory;
    })
    .sort((a, b) => {
      if (sort === 'date_newest') return b.createdAt - a.createdAt;
      if (sort === 'date_oldest') return a.createdAt - b.createdAt;
      if (sort === 'price') return b.purchasePrice - a.purchasePrice;
      if (sort === 'profit') {
        const getProfit = (i: Item) =>
            i.status === 'sold'
                ? (i.salePrice || 0) - i.purchasePrice - (i.fees || 0) - (i.shippingCost || 0)
                : -999999999;
        return getProfit(b) - getProfit(a);
      }
      return 0;
    });

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="pt-4 pb-24 min-h-screen flex flex-col">
      {/* Header with increased padding for alignment */}
      <header className="px-5 mb-4 space-y-4">
        <div className="flex justify-between items-end">
          <h1 className="text-3xl font-bold text-ios-text dark:text-white">Inventář</h1>

          {/* Sort Dropdown */}
          <div className="relative">
             <div className="flex items-center space-x-1 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 shadow-sm">
                <ArrowUpDown size={14} className="text-ios-blue" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="bg-transparent text-xs font-medium text-gray-700 dark:text-gray-300 appearance-none focus:outline-none pr-1"
                >
                  <option value="date_newest">Nejnovější</option>
                  <option value="date_oldest">Nejstarší</option>
                  <option value="profit">Nejvyšší zisk</option>
                  <option value="price">Nejdražší</option>
                </select>
             </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-[#1C1C1E] border-none rounded-xl text-ios-text dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-ios-blue shadow-sm"
            placeholder="Hledat (např. Gotland, boty...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Grid - 4 columns, fits on screen */}
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                style={isSelected ? {
                  background: cat.id === 'all' ? 'linear-gradient(135deg, #dc2626, #f97316)' :
                              cat.id === 'overalls' ? 'linear-gradient(135deg, #3b82f6, #22d3ee)' :
                              cat.id === 'jackets' ? 'linear-gradient(135deg, #f97316, #ef4444)' :
                              cat.id === 'softshell' ? 'linear-gradient(135deg, #10b981, #4ade80)' :
                              cat.id === 'pants' ? 'linear-gradient(135deg, #8b5cf6, #a855f7)' :
                              cat.id === 'shoes' ? 'linear-gradient(135deg, #f59e0b, #facc15)' :
                              cat.id === 'accessories' ? 'linear-gradient(135deg, #ec4899, #fb7185)' :
                              'linear-gradient(135deg, #6366f1, #2563eb)'
                } : undefined}
                className={`relative flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all duration-200 border-2 ${
                  isSelected
                    ? 'text-white shadow-lg border-transparent scale-105'
                    : 'bg-white dark:bg-[#2C2C2E] border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 shadow-sm'
                }`}
              >
                <cat.icon
                  className={`w-5 h-5 mb-1 ${isSelected ? 'text-white' : cat.iconColor}`}
                  strokeWidth={isSelected ? 2.5 : 2}
                />
                <span className={`text-[9px] font-semibold leading-tight text-center ${
                  isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-gray-200/50 dark:bg-gray-800 p-1 rounded-lg">
          {(['all', 'active', 'sold'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                filter === f
                  ? 'bg-white dark:bg-[#1C1C1E] text-ios-text dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {f === 'all' ? 'Vše' : f === 'active' ? 'Na prodej' : 'Prodané'}
            </button>
          ))}
        </div>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 px-5">
        {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="animate-fade-in-up opacity-0"
              style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s`, animationFillMode: 'forwards' }}
            >
              <InventoryCard
                  item={item}
                  navigate={navigate}
                  formatCurrency={formatCurrency}
                  onQuickSale={handleQuickSale}
              />
            </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="px-5 mt-4">
          {items.length === 0 ? (
            <EmptyState type="inventory" onAction={() => navigate('/add')} />
          ) : (
            <div className="text-center py-20 animate-fade-in">
              <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="text-gray-400" size={32} />
              </div>
              <p className="text-gray-800 dark:text-white font-semibold text-lg">Žádné položky</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Zkuste změnit filtry nebo hledaný výraz.</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Sale Modal */}
      <QuickSaleModal
        item={quickSaleItem}
        isOpen={isQuickSaleOpen}
        onClose={() => {
          setIsQuickSaleOpen(false);
          setQuickSaleItem(null);
        }}
        onSave={handleQuickSaleSave}
      />
    </div>
  );
};

export default Inventory;
