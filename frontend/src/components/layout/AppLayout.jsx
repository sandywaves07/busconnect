import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-[1400px] mx-auto px-4 pt-16">
        <div className="flex gap-4 min-h-[calc(100vh-64px)]">
          {/* Left Sidebar */}
          <div className="w-60 flex-shrink-0">
            <div className="sidebar-fixed py-4">
              <LeftSidebar />
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0 py-4">
            <Outlet />
          </main>

          {/* Right Sidebar */}
          <div className="w-72 flex-shrink-0 hidden xl:block">
            <div className="sidebar-fixed py-4">
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
