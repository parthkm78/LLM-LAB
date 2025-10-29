import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import DashboardSidebar from '../Dashboard/DashboardSidebar';

// Import dashboard page components (we'll create these next)
import DashboardOverview from './pages/DashboardOverview';
import ParameterTesting from './pages/ParameterTesting';
import QualityMetrics from './pages/QualityMetrics';
import ResponseComparison from './pages/ResponseComparison';
import BatchExperiments from './pages/BatchExperiments';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import DatasetManager from './pages/DatasetManager';
import ModelManagement from './pages/ModelManagement';
import DashboardSettings from './pages/DashboardSettings';

const EnhancedDashboardLayout = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
      case 'recent':
        return <DashboardOverview section={activeSection} />;
      case 'parameters':
        return <ParameterTesting />;
      case 'quality':
        return <QualityMetrics />;
      case 'comparison':
        return <ResponseComparison />;
      case 'batch':
        return <BatchExperiments />;
      case 'analytics':
        return <AdvancedAnalytics />;
      case 'datasets':
        return <DatasetManager />;
      case 'models':
        return <ModelManagement />;
      case 'settings':
        return <DashboardSettings />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
              <p className="text-gray-600">This feature is currently under development.</p>
            </div>
          </div>
        );
    }
  };

  const getSectionTitle = () => {
    const titles = {
      overview: 'Dashboard Overview',
      recent: 'Recent Activity',
      parameters: 'Parameter Testing',
      quality: 'Quality Metrics',
      comparison: 'Response Comparison',
      batch: 'Batch Experiments',
      analytics: 'Advanced Analytics',
      intelligence: 'AI Insights',
      datasets: 'Dataset Manager',
      export: 'Export & Reports',
      optimization: 'Auto-Optimizer',
      models: 'Model Management',
      presets: 'Parameter Presets',
      settings: 'Settings'
    };
    return titles[activeSection] || 'Dashboard';
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <DashboardSidebar 
              activeSection={activeSection} 
              onSectionChange={(section) => {
                setActiveSection(section);
                setMobileSidebarOpen(false);
              }}
              isCollapsed={false}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <DashboardSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          isCollapsed={sidebarCollapsed}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>

              {/* Desktop sidebar toggle */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:block p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>

              {/* Page Title */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{getSectionTitle()}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {activeSection === 'overview' && 'Complete overview of your LLM analysis activities'}
                  {activeSection === 'parameters' && 'Configure and test LLM parameters for optimal responses'}
                  {activeSection === 'quality' && 'Comprehensive quality analysis and metrics'}
                  {activeSection === 'comparison' && 'Compare multiple responses side by side'}
                  {activeSection === 'batch' && 'Run batch experiments with multiple parameter combinations'}
                  {activeSection === 'analytics' && 'Advanced analytics, trends, and insights'}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span>System Healthy</span>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  New Experiment
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="h-full">
            {renderActiveSection()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnhancedDashboardLayout;
