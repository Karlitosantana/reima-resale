export type Platform = 'Vinted' | 'Facebook' | 'Aukro' | 'Depop' | 'Jiné';

export type ItemCategory = 'overalls' | 'jackets' | 'pants' | 'softshell' | 'shoes' | 'accessories' | 'other';

export type ItemCondition = 'new' | 'like_new' | 'good' | 'fair';

export interface Item {
  id: string;
  name: string;
  description?: string;
  notes?: string;
  category?: ItemCategory;
  size?: string;
  condition?: ItemCondition;
  purchasePrice: number;
  purchaseDate: string;
  purchaseSource: string;
  status: 'active' | 'sold';
  listingUrl?: string;

  // Sale details
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
}
