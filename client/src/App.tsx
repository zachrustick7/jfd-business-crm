import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ContactsPage from './pages/Contacts/ContactsPage';
import MessagingPage from './pages/Messaging/MessagingPage';
import TemplatesPage from './pages/Templates/TemplatesPage';
import MessageHistoryPage from './pages/MessageHistory/MessageHistoryPage';
import LoadingSpinner from './components/Common/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/messaging" element={<MessagingPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/message-history" element={<MessageHistoryPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App; 