import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Navbar } from './Navbar.jsx';
import { MobileDrawer } from './MobileDrawer.jsx';
import { FloatingAIAssistant } from '../ai/FloatingAIAssistant.jsx';

export const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Permanent Desktop Sidebar */}
      <Sidebar />

      {/* Slide-out Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="page-body">
          <Outlet />
        </main>
      </div>

      {/* Global AI Copilot Assistant */}
      <FloatingAIAssistant />
    </div>
  );
};
