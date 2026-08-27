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
import { RoleManagementPage } from './pages/roles/RoleManagementPage';
import { CustomerListPage } from './pages/customers/CustomerListPage';
import { CustomerDetailPage } from './pages/customers/CustomerDetailPage';
import { TemplateManagementPage } from './pages/templates/TemplateManagementPage';

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

                <Route element={<ProtectedRoute allowedRoleNames={['Super Admin']} />}>
                  <Route path="admin/businesses" element={<SuperAdminDashboard />} />
                </Route>

                <Route element={<ProtectedRoute requiredPermission="menu:staff" />}>
                  <Route path="staff" element={<StaffManagementPage />} />
                </Route>

                <Route element={<ProtectedRoute requiredPermission="menu:roles" />}>
                  <Route path="roles" element={<RoleManagementPage />} />
                </Route>

                <Route element={<ProtectedRoute requiredPermission="menu:customers" />}>
                  <Route path="customers" element={<CustomerListPage />} />
                  <Route path="customers/:id" element={<CustomerDetailPage />} />
                </Route>

                <Route element={<ProtectedRoute requiredPermission="menu:templates" />}>
                  <Route path="templates" element={<TemplateManagementPage />} />
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
