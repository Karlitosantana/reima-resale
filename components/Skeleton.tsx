import React from 'react';

// Base skeleton with shimmer animation
const SkeletonBase: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] rounded-lg ${className}`}
    style={{ animation: 'shimmer 1.5s infinite' }}
  />
);

// Skeleton for stat cards on dashboard
export const SkeletonStatCard: React.FC = () => (
  <div className="bg-ios-card dark:bg-[#1C1C1E] p-4 rounded-2xl shadow-ios-card border border-transparent dark:border-white/5">
    <div className="flex items-center space-x-2 mb-2">
      <SkeletonBase className="w-5 h-5 rounded" />
      <SkeletonBase className="w-16 h-3" />
    </div>
    <SkeletonBase className="w-20 h-8 mb-2" />
    <SkeletonBase className="w-24 h-3" />
  </div>
);

// Skeleton for main profit card
export const SkeletonMainCard: React.FC = () => (
  <div className="bg-ios-card dark:bg-[#1C1C1E] rounded-2xl p-5 shadow-ios-card border border-white/50 dark:border-white/5">
    <div className="flex justify-between items-start mb-4">
      <div>
        <SkeletonBase className="w-24 h-3 mb-2" />
        <SkeletonBase className="w-32 h-9" />
      </div>
      <SkeletonBase className="w-10 h-10 rounded-full" />
    </div>
    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
      <div>
        <SkeletonBase className="w-12 h-3 mb-2" />
        <SkeletonBase className="w-20 h-6" />
      </div>
      <div>
        <SkeletonBase className="w-12 h-3 mb-2" />
        <SkeletonBase className="w-20 h-6" />
      </div>
    </div>
  </div>
);

// Skeleton for chart section
export const SkeletonChart: React.FC = () => (
  <div className="bg-ios-card dark:bg-[#1C1C1E] p-5 rounded-2xl shadow-ios-card border border-transparent dark:border-white/5">
    <div className="flex items-center justify-between mb-6">
      <SkeletonBase className="w-32 h-5" />
      <div className="flex gap-3">
        <SkeletonBase className="w-12 h-3" />
        <SkeletonBase className="w-12 h-3" />
      </div>
    </div>
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between">
            <SkeletonBase className="w-8 h-3" />
            <SkeletonBase className="w-24 h-3" />
          </div>
          <SkeletonBase className="w-full h-6 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

// Skeleton for inventory card
export const SkeletonInventoryCard: React.FC = () => (
  <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden shadow-ios-card border border-transparent dark:border-white/5">
    <SkeletonBase className="aspect-square w-full rounded-none" />
    <div className="p-3">
      <SkeletonBase className="w-full h-4 mb-2" />
      <SkeletonBase className="w-2/3 h-4 mb-3" />
      <div className="flex justify-between items-end">
        <div>
          <SkeletonBase className="w-10 h-3 mb-1" />
          <SkeletonBase className="w-16 h-4" />
        </div>
        <SkeletonBase className="w-8 h-8 rounded-full" />
      </div>
    </div>
  </div>
);

// Skeleton for category filters
export const SkeletonCategories: React.FC = () => (
  <div className="grid grid-cols-4 gap-2">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex flex-col items-center py-2.5 px-1 rounded-xl bg-gray-100 dark:bg-gray-800">
        <SkeletonBase className="w-5 h-5 mb-1 rounded" />
        <SkeletonBase className="w-10 h-2" />
      </div>
    ))}
  </div>
);

// Dashboard skeleton layout
export const DashboardSkeleton: React.FC = () => (
  <div className="px-5 pt-8 pb-4 space-y-6">
    <style>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>

    {/* Header */}
    <header className="mb-6">
      <SkeletonBase className="w-32 h-9 mb-2" />
      <SkeletonBase className="w-48 h-4" />
    </header>

    {/* Main card */}
    <SkeletonMainCard />

    {/* Stats grid */}
    <div className="grid grid-cols-2 gap-4">
      <SkeletonStatCard />
      <SkeletonStatCard />
      <SkeletonStatCard />
      <SkeletonStatCard />
    </div>

    {/* Chart */}
    <SkeletonChart />

    {/* Platform section */}
    <SkeletonChart />
  </div>
);

// Inventory skeleton layout
export const InventorySkeleton: React.FC = () => (
  <div className="pt-4 pb-24">
    <style>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>

    <header className="px-5 mb-4 space-y-4">
      {/* Title row */}
      <div className="flex justify-between items-end">
        <SkeletonBase className="w-28 h-9" />
        <SkeletonBase className="w-24 h-8 rounded-lg" />
      </div>

      {/* Search bar */}
      <SkeletonBase className="w-full h-12 rounded-xl" />

      {/* Categories */}
      <SkeletonCategories />

      {/* Filter tabs */}
      <SkeletonBase className="w-full h-10 rounded-lg" />
    </header>

    {/* Grid */}
    <div className="grid grid-cols-2 gap-4 px-5">
      {[...Array(6)].map((_, i) => (
        <SkeletonInventoryCard key={i} />
      ))}
    </div>
  </div>
);

export default SkeletonBase;
