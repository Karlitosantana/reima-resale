import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import ItemForm from './components/ItemForm';
import { ToastProvider } from './components/Toast';
import { DashboardSkeleton, InventorySkeleton } from './components/Skeleton';
import { getItems } from './services/storage';
import { Item } from './types';

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    // Keep loading true only on initial load to avoid flicker on updates
    const data = await getItems();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    // Initial load
    refreshData();

    // Listen for changes triggered by saveItem/deleteItem
    window.addEventListener('storage-update', refreshData);

    return () => {
      window.removeEventListener('storage-update', refreshData);
    };
  }, []);

  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={
            <Layout>
              {loading ? <DashboardSkeleton /> : <Dashboard items={items} />}
            </Layout>
          } />
          <Route path="/inventory" element={
            <Layout>
              {loading ? <InventorySkeleton /> : <Inventory items={items} />}
            </Layout>
          } />
          {/* Standalone pages (modals) covering the layout */}
          <Route path="/add" element={<ItemForm />} />
          <Route path="/edit/:id" element={<ItemForm />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
};

export default App;
