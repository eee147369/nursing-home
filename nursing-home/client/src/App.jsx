import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NurseManagement from './pages/NurseManagement';
import RelativeManagement from './pages/RelativeManagement';
import OrderManagement from './pages/OrderManagement';
import ProjectManagement from './pages/ProjectManagement';
import AdminSettings from './pages/AdminSettings';

export default function App() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, key: Date.now() });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <Layout toast={toast} onClearToast={() => setToast(null)}>
      <Routes>
        <Route path="/" element={<Dashboard showToast={showToast} />} />
        <Route path="/nurses" element={<NurseManagement showToast={showToast} />} />
        <Route path="/relatives" element={<RelativeManagement showToast={showToast} />} />
        <Route path="/orders" element={<OrderManagement showToast={showToast} />} />
        <Route path="/projects" element={<ProjectManagement showToast={showToast} />} />
        <Route path="/settings" element={<AdminSettings showToast={showToast} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
