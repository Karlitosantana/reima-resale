import { Item } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'resale_tracker_items';

// Admin user with full database access
const ADMIN_EMAIL = 'karpenet@me.com';

export const generateId = () => Math.random().toString(36).substr(2, 9);

// Notify helper
const notifyChange = () => {
  window.dispatchEvent(new Event('storage-update'));
};

// Get current user info securely
const getCurrentUser = async (): Promise<{ id: string; email: string } | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return { id: user.id, email: user.email || '' };
  } catch {
    return null;
  }
};

// Check if current user is admin
const isAdmin = (email: string): boolean => {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

// Fallback dummy data for initial seeding if needed
const dummyData: Item[] = [
  {
    id: '1',
    name: 'Reima Gotland Winter Overall',
    category: 'overalls',
    purchasePrice: 1800,
    purchaseDate: '2023-09-15',
    purchaseSource: 'Vinted',
    status: 'sold',
    salePrice: 2900,
    saleDate: '2023-11-20',
    salePlatform: 'Facebook',
    fees: 0,
    shippingCost: 79,
    images: ['https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    createdAt: Date.now()
  },
  {
    id: '2',
    name: 'Reima Stavanger (Navy)',
    category: 'overalls',
    purchasePrice: 2200,
    purchaseDate: '2023-10-01',
    purchaseSource: 'Sleva E-shop',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1545648580-7798782eb86e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    createdAt: Date.now()
  },
  {
    id: '3',
    name: 'Reima Tec Boots Laplander',
    category: 'shoes',
    purchasePrice: 800,
    purchaseDate: '2023-10-10',
    purchaseSource: 'Marketplace',
    status: 'sold',
    salePrice: 1500,
    saleDate: '2023-12-05',
    salePlatform: 'Vinted',
    fees: 0,
    shippingCost: 65,
    images: ['https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    createdAt: Date.now()
  }
];

// --- Internal Local Helpers ---
const getLocalItems = (): Item[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const setLocalItems = (items: Item[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("LocalStorage Save Error (Quota Exceeded?):", e);
  }
};

// Helper to migrate old items to new structure with quantity and sales
const migrateItem = (item: any): Item => {
  if (!item) return {
    id: generateId(),
    name: '',
    category: 'other',
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseSource: '',
    status: 'active',
    images: [],
    quantity: 1,
    sales: [],
    createdAt: Date.now()
  } as Item;

  if (!item.images) {
    // If 'images' is missing, check for legacy 'imageUrl'
    // @ts-ignore - explicitly handling legacy field
    if (item.imageUrl) {
      // @ts-ignore
      item.images = [item.imageUrl];
    } else {
      item.images = [];
    }
  }
  // Ensure category exists
  if (!item.category) {
      item.category = 'other';
  }
  // Ensure numeric fields are numbers
  if (item.purchasePrice) item.purchasePrice = Number(item.purchasePrice) || 0;
  if (item.salePrice) item.salePrice = Number(item.salePrice) || 0;
  if (item.fees) item.fees = Number(item.fees) || 0;
  if (item.shippingCost) item.shippingCost = Number(item.shippingCost) || 0;

  // Migrate quantity - default to 1 if not set
  if (!item.quantity || item.quantity < 1) {
    item.quantity = 1;
  }

  // Migrate sales array
  if (!item.sales) {
    item.sales = [];
    // If item was already sold (legacy), create a sale record from legacy fields
    if (item.status === 'sold' && item.salePrice && item.quantity === 1) {
      item.sales = [{
        id: generateId(),
        salePrice: item.salePrice,
        salePlatform: item.salePlatform || 'Jiné',
        saleDate: item.saleDate || new Date().toISOString().split('T')[0],
        fees: item.fees || 0,
        shippingCost: item.shippingCost || 0
      }];
    }
  }

  return item as Item;
};

// --- Public Async API ---

export const getItems = async (): Promise<Item[]> => {
  // 1. If Supabase is configured, try to fetch from cloud
  if (isSupabaseConfigured()) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      console.warn('No authenticated user, returning empty items');
      return [];
    }

    console.log('Fetching items for user:', currentUser.email);

    try {
      // Fetch ALL items - admin has full access
      // Using * to get all columns regardless of schema
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .limit(1000);

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      console.log('Fetched items count:', data?.length || 0);

      // 2. Migration Check: If cloud is empty but we have local data, upload it automatically
      if ((!data || data.length === 0) && getLocalItems().length > 0) {
        console.log('Migrating local data to cloud...');
        const localItems = getLocalItems();
        const migratedLocal = localItems.map(migrateItem);
        for (const item of migratedLocal) {
            await saveItem(item);
        }
        return migratedLocal;
      }

      // 3. If cloud is empty and no local data, seed dummy data to cloud
      if ((!data || data.length === 0) && getLocalItems().length === 0) {
          console.log('Seeding cloud with dummy data...');
          for (const item of dummyData) {
              await saveItem(item);
          }
          return dummyData;
      }

      // Map Supabase rows back to Item objects
      console.log('Sample row structure:', data[0] ? Object.keys(data[0]) : 'no data');

      return data.map((row: any) => {
          // Handle both: data stored in JSONB 'data' column OR directly as columns
          const itemData = row.data || row;
          // Apply migration logic to ensure images array exists
          const migrated = migrateItem(itemData);
          return {
              ...migrated,
              id: row.id || migrated.id,
              // Map common alternative column names
              saleDate: migrated.saleDate || row.sale_date || row.saleDate,
              salePlatform: migrated.salePlatform || row.sale_platform || row.salePlatform,
              salePrice: migrated.salePrice || row.sale_price || row.salePrice,
              purchasePrice: migrated.purchasePrice || row.purchase_price || row.purchasePrice,
              purchaseDate: migrated.purchaseDate || row.purchase_date || row.purchaseDate,
              createdAt: migrated.createdAt || row.created_at || row.createdAt || Date.now()
          };
      });

    } catch (err) {
      console.error('Supabase fetch error, falling back to local:', err);
      return getLocalItems().map(migrateItem);
    }
  }

  // Fallback if no cloud config
  let items = getLocalItems();

  if (items.length > 0) {
     items = items.map(migrateItem);
     // If migration changed structure, save it back
     setLocalItems(items);
  } else {
    items = dummyData;
    setLocalItems(items);
  }
  return items;
};

export const saveItem = async (item: Item): Promise<void> => {
  // Always save to local for cache/offline
  const localItems = getLocalItems().map(migrateItem);
  const index = localItems.findIndex(i => i.id === item.id);
  if (index >= 0) localItems[index] = item;
  else localItems.push(item);
  setLocalItems(localItems);

  if (isSupabaseConfigured()) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      // Save item to cloud database
      const { error } = await supabase
        .from('items')
        .upsert({
          id: item.id,
          name: item.name,
          data: item, // Store full object in JSONB column
          created_at: item.createdAt
        });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to save to cloud:', err);
      // Propagate error up so UI can stop spinning
      throw err;
    }
  }

  notifyChange();
};

export const deleteItem = async (id: string): Promise<void> => {
  const localItems = getLocalItems().filter(i => i.id !== id);
  setLocalItems(localItems);

  if (isSupabaseConfigured()) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      // Delete item by id
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to delete from cloud:', err);
      throw err;
    }
  }

  notifyChange();
};

export const createEmptyItem = (): Item => ({
  id: generateId(),
  name: '',
  category: 'other',
  purchasePrice: 0,
  purchaseDate: new Date().toISOString().split('T')[0],
  purchaseSource: '',
  status: 'active',
  images: [],
  notes: '',
  size: '',
  condition: undefined,
  listingUrl: '',
  quantity: 1,
  sales: [],
  createdAt: Date.now()
});
