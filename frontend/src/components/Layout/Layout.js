import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Ambient Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-gradient-to-tr from-emerald-200/10 to-teal-200/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Main Layout Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        {/* Main Content Area */}
        <main className="flex-1 pt-16 sm:pt-20 pb-4 sm:pb-8">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
