export type Platform = 'Vinted' | 'Facebook' | 'Aukro' | 'Depop' | 'Jiné';

export type ItemCategory = 'overalls' | 'jackets' | 'pants' | 'softshell' | 'shoes' | 'accessories' | 'other';

export interface Item {
  id: string;
  name: string;
  description?: string;
  category?: ItemCategory;
  purchasePrice: number;
  purchaseDate: string;
  purchaseSource: string;
  status: 'active' | 'sold';

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
