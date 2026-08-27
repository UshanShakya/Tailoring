import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardShellPage } from './pages/DashboardShellPage';
import { OverviewPage } from './pages/OverviewPage';
import { SuperAdminDashboard } from './pages/admin/SuperAdminDashboard';
import { StaffManagementPage } from './pages/staff/StaffManagementPage';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardShellPage />}>
                <Route index element={<OverviewPage />} />
                
                <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
                  <Route path="admin/businesses" element={<SuperAdminDashboard />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['BUSINESS_ADMIN', 'STAFF_FULL']} />}>
                  <Route path="staff" element={<StaffManagementPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
