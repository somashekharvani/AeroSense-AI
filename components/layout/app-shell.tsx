'use client';

import * as React from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { BottomNav } from './bottom-nav';
import { Footer } from './footer';
import { SettingsDialog } from './settings-dialog';
import { LocationDialog } from '@/components/location/location-dialog';
import { WelcomeModal } from '@/components/location/welcome-modal';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#05080c] text-slate-100">
      {/* First-Visit Onboarding Welcome Modal */}
      <WelcomeModal />

      {/* Persistent Location Picker Dialog */}
      <LocationDialog />

      {/* Settings & Privacy Dialog */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Sticky Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(true)}
      />

      {/* Main Viewport Layout: Sidebar + Main Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <BottomNav onOpenMenu={() => setIsSidebarOpen(true)} />
    </div>
  );
}
