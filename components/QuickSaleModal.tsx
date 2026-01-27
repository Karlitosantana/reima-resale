import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, Calendar, Tag } from 'lucide-react';
import { Item, Platform } from '../types';

interface QuickSaleModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Item) => void;
}

const PLATFORMS: { id: Platform; label: string; color: string; lightBg: string; border: string; text: string }[] = [
  { id: 'Vinted', label: 'Vinted', color: '#34C759', lightBg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-600 dark:text-green-400' },
  { id: 'Facebook', label: 'Facebook', color: '#007AFF', lightBg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-600 dark:text-blue-400' },
  { id: 'Jiné', label: 'Jiné', color: '#FF9500', lightBg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-600 dark:text-orange-400' },
];

const QuickSaleModal: React.FC<QuickSaleModalProps> = ({ item, isOpen, onClose, onSave }) => {
  const [salePrice, setSalePrice] = useState('');
  const [salePlatform, setSalePlatform] = useState<Platform>('Vinted');
  const [fees, setFees] = useState('0');
  const [shippingCost, setShippingCost] = useState('0');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (item && isOpen) {
      // Reset form when opening with new item
      setSalePrice('');
      setFees('0');
      setShippingCost('0');
      setSaleDate(new Date().toISOString().split('T')[0]);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleSave = () => {
    const updatedItem: Item = {
      ...item,
      status: 'sold',
      salePrice: Number(salePrice) || 0,
      salePlatform,
      fees: Number(fees) || 0,
      shippingCost: Number(shippingCost) || 0,
      saleDate
    };
    onSave(updatedItem);
    onClose();
  };

  const calculatedProfit = (Number(salePrice) || 0) - item.purchasePrice - (Number(fees) || 0) - (Number(shippingCost) || 0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(val);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center">
        <div className="max-w-md w-full bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-2xl animate-slide-up mx-4 max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-lg font-bold text-ios-text dark:text-white">Rychlý prodej</h2>
              <p className="text-xs text-ios-textSec truncate max-w-[200px]">{item.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-ios-textSec" />
            </button>
          </div>

          {/* Form */}
          <div className="p-5 space-y-4">
            {/* Sale Price - Main Input */}
            <div>
              <label className="block text-xs font-semibold text-ios-textSec uppercase tracking-wider mb-2">
                Prodejní cena *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <DollarSign size={18} className="text-ios-blue" />
                </div>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="0"
                  className="w-full pl-11 pr-12 py-4 text-2xl font-bold bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-transparent focus:border-ios-blue focus:outline-none text-ios-text dark:text-white"
                  autoFocus
                />
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-ios-textSec font-medium">
                  Kč
                </span>
              </div>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-xs font-semibold text-ios-textSec uppercase tracking-wider mb-2">
                Platforma
              </label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSalePlatform(platform.id)}
                    style={salePlatform === platform.id ? { backgroundColor: platform.color } : undefined}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border ${
                      salePlatform === platform.id
                        ? 'text-white shadow-md border-transparent'
                        : `${platform.lightBg} ${platform.border} ${platform.text}`
                    }`}
                  >
                    {platform.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date and Fees Row */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-ios-textSec uppercase tracking-wider mb-1.5">
                  Datum
                </label>
                <input
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border-0 focus:ring-2 focus:ring-ios-blue text-ios-text dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-ios-textSec uppercase tracking-wider mb-1.5">
                  Poplatky
                </label>
                <input
                  type="number"
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border-0 focus:ring-2 focus:ring-ios-blue text-ios-text dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-ios-textSec uppercase tracking-wider mb-1.5">
                  Poštovné
                </label>
                <input
                  type="number"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border-0 focus:ring-2 focus:ring-ios-blue text-ios-text dark:text-white"
                />
              </div>
            </div>

            {/* Profit Preview */}
            <div className={`p-4 rounded-xl ${calculatedProfit >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-full ${calculatedProfit >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <Tag size={14} className={calculatedProfit >= 0 ? 'text-ios-green' : 'text-ios-red'} />
                  </div>
                  <span className="text-sm font-medium text-ios-textSec">Očekávaný zisk</span>
                </div>
                <span className={`text-xl font-bold ${calculatedProfit >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                  {calculatedProfit >= 0 ? '+' : ''}{formatCurrency(calculatedProfit)}
                </span>
              </div>
              <p className="text-[10px] text-ios-textSec mt-2">
                Nákup: {formatCurrency(item.purchasePrice)} + Poplatky: {formatCurrency(Number(fees) + Number(shippingCost))}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="p-5">
            <button
              onClick={handleSave}
              disabled={!salePrice || Number(salePrice) <= 0}
              className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 ${
                salePrice && Number(salePrice) > 0
                  ? 'bg-ios-green hover:bg-green-600 active:scale-[0.98] shadow-lg shadow-green-500/30'
                  : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
              }`}
            >
              <Check size={20} />
              Označit jako prodané
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickSaleModal;
