import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import ItemForm from './components/ItemForm';
import AuthPage from './components/AuthPage';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardSkeleton, InventorySkeleton } from './components/Skeleton';
import { getItems } from './services/storage';
import { Item } from './types';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ios-gray dark:bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-ios-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <>{children}</>;
};

// Main App content (needs auth context)
const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const data = await getItems();
      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      refreshData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    // Listen for changes triggered by saveItem/deleteItem
    window.addEventListener('storage-update', refreshData);

    return () => {
      window.removeEventListener('storage-update', refreshData);
    };
  }, [user]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              {loading ? <DashboardSkeleton /> : <Dashboard items={items} />}
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/inventory" element={
          <ProtectedRoute>
            <Layout>
              {loading ? <InventorySkeleton /> : <Inventory items={items} />}
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/add" element={
          <ProtectedRoute>
            <ItemForm />
          </ProtectedRoute>
        } />
        <Route path="/edit/:id" element={
          <ProtectedRoute>
            <ItemForm />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
