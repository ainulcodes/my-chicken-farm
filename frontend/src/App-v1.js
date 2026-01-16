import React from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard-v1';
import DashboardPublic from './components/DashboardPublic';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import { Toaster } from './components/ui/sonner';

import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter basename="/my-chicken-farm">
          <Routes>
            <Route path="/" element={<DashboardPublic />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <Dashboard readOnly={false} />
                </PrivateRoute>
              }
            />
          </Routes>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
