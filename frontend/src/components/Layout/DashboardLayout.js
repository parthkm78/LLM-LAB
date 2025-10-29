import React, { useState } from 'react';
import { 
  BeakerIcon, 
  ChartBarIcon, 
  DocumentTextIcon, 
  CogIcon,
  HomeIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { designTokens } from '../../styles/designTokens';

const DashboardLayout = ({ children, currentPage = 'experiment' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { 
      name: 'Experiment Lab', 
      href: '/experiment', 
      icon: BeakerIcon, 
      current: currentPage === 'experiment',
      description: 'Create and run LLM experiments'
    },
    { 
      name: 'Analytics Dashboard', 
      href: '/analytics', 
      icon: ChartBarIcon, 
      current: currentPage === 'analytics',
      description: 'Visualize experiment results'
    },
    { 
      name: 'Parameter Insights', 
      href: '/insights', 
      icon: SparklesIcon, 
      current: currentPage === 'insights',
      description: 'AI-powered parameter optimization'
    },
    { 
      name: 'Experiments History', 
      href: '/experiments', 
      icon: DocumentTextIcon, 
      current: currentPage === 'experiments',
      description: 'Browse past experiments'
    },
    { 
      name: 'Benchmarks', 
      href: '/benchmarks', 
      icon: ArrowTrendingUpIcon, 
      current: currentPage === 'benchmarks',
      description: 'Compare against industry standards'
    }
  ];

  const secondaryNavigation = [
    { name: 'Settings', href: '/settings', icon: CogIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-overlay bg-neutral-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-modal w-72 transform transition-transform duration-300 ease-inOut
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="flex h-full flex-col bg-white/80 backdrop-blur-xl border-r border-neutral-200/50 shadow-xl">
          {/* Logo and brand */}
          <div className="flex h-16 items-center gap-3 px-6 border-b border-neutral-200/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
              <BeakerIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-900">LLM Analyzer</h1>
              <p className="text-xs text-neutral-500">Parameter Intelligence</p>
            </div>
            
            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto p-2 rounded-lg hover:bg-neutral-100 lg:hidden"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                      ${item.current
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 ${item.current ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className={`text-xs ${item.current ? 'text-primary-100' : 'text-neutral-500'}`}>
                        {item.description}
                      </div>
                    </div>
                    {item.current && (
                      <div className="h-2 w-2 rounded-full bg-white/30" />
                    )}
                  </a>
                );
              })}
            </div>

            {/* Secondary navigation */}
            <div className="border-t border-neutral-200 pt-6">
              {secondaryNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                  >
                    <Icon className="h-5 w-5 text-neutral-400 group-hover:text-neutral-600" />
                    {item.name}
                  </a>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-neutral-200 p-4">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200/50">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <SparklesIcon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-primary-800">AI-Powered</p>
                <p className="text-xs text-primary-600 truncate">Parameter optimization ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        {/* Top header */}
        <header className="sticky top-0 z-sticky bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 shadow-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-neutral-100 lg:hidden"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>

              {/* Desktop sidebar toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex p-2 rounded-lg hover:bg-neutral-100 text-neutral-600"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>

              {/* Page title and breadcrumb */}
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 capitalize">
                  {currentPage.replace('-', ' ')}
                </h2>
                <p className="text-sm text-neutral-500">
                  Analyze LLM behavior through parameter experimentation
                </p>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-3">
              {/* Status indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 border border-green-200">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-green-800">Online</span>
              </div>

              {/* User avatar placeholder */}
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <span className="text-xs font-medium text-white">U</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
