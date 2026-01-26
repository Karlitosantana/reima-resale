import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import ItemForm from './components/ItemForm';
import { getItems } from './services/storage';
import { Item } from './types';
import { Loader2 } from 'lucide-react';

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

  if (loading) {
      return (
          <div className="min-h-screen bg-ios-gray flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-ios-blue mb-2" size={32} />
              <p className="text-ios-textSec text-sm font-medium">Synchronizace dat...</p>
          </div>
      );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={
          <Layout>
            <Dashboard items={items} />
          </Layout>
        } />
        <Route path="/inventory" element={
          <Layout>
            <Inventory items={items} />
          </Layout>
        } />
        {/* Standalone pages (modals) covering the layout */}
        <Route path="/add" element={<ItemForm />} />
        <Route path="/edit/:id" element={<ItemForm />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
