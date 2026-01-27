export type Platform = 'Vinted' | 'Facebook' | 'Aukro' | 'Depop' | 'Jiné';

export type ItemCategory = 'overalls' | 'jackets' | 'pants' | 'softshell' | 'shoes' | 'accessories' | 'other';

export type ItemCondition = 'new' | 'like_new' | 'good' | 'fair';

// Individual sale record for items with quantity > 1
export interface Sale {
  id: string;
  salePrice: number;
  salePlatform: Platform;
  saleDate: string;
  fees: number;
  shippingCost: number;
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  notes?: string;
  category?: ItemCategory;
  size?: string;
  condition?: ItemCondition;
  purchasePrice: number;  // Price per unit
  purchaseDate: string;
  purchaseSource: string;
  status: 'active' | 'sold';  // 'sold' when all quantity is sold
  listingUrl?: string;

  // Quantity tracking
  quantity: number;  // Total quantity purchased
  sales: Sale[];     // Individual sales records

  // Legacy sale details (for backward compatibility with quantity=1 items)
  salePrice?: number;
  saleDate?: string;
  salePlatform?: Platform;
  fees?: number;
  shippingCost?: number;

  // Visual - Changed from imageUrl to images array
  images: string[];

  // Calculated
  createdAt: number;
}

export interface DashboardStats {
  totalProfit: number;
  totalRevenue: number;
  totalCost: number;
  soldCount: number;
  activeCount: number;
  inventoryValue: number;
  averageSalePrice: number;
  averageProfit: number;
  roi: number;
}
