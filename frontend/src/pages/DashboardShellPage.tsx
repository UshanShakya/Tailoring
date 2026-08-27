import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';
import { ThemeProvider } from '../context/ThemeContext';

export const DashboardShellPage: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-canvas flex text-ink">
        {/* Clean Collapsible Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Reusable TopBar with Global Search & Theme Toggle */}
          <TopBar />

          <main className="flex-1 p-6 overflow-y-auto max-w-6xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};
