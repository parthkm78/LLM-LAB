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
import SingleExperimentResults from './pages/SingleExperimentResults';
import BatchResultsAnalysis from './pages/BatchResultsAnalysis';
import ExperimentHistory from './pages/ExperimentHistory';
import AdvancedCreativeAnalysis from './pages/AdvancedCreativeAnalysis';

const EnhancedDashboardLayout = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentExperimentData, setCurrentExperimentData] = useState(null);

  const handleNavigateWithData = (section, experimentData = null) => {
    setCurrentExperimentData(experimentData);
    setActiveSection(section);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
      case 'recent':
        return <DashboardOverview section={activeSection} />;
      case 'parameters':
        return <ParameterTesting onNavigate={setActiveSection} onNavigateWithData={handleNavigateWithData} />;
      case 'quality':
        return <QualityMetrics />;
      case 'comparison':
        return <ResponseComparison />;
      case 'batch':
        return <BatchExperiments />;
      case 'analytics':
        return <AdvancedAnalytics experimentData={currentExperimentData} onBack={() => setActiveSection('parameters')} />;
      case 'creative-analysis':
        return <AdvancedCreativeAnalysis experimentData={currentExperimentData} onBack={() => setActiveSection('parameters')} />;
      case 'datasets':
        return <DatasetManager />;
      case 'models':
        return <ModelManagement />;
      case 'settings':
        return <DashboardSettings />;
      case 'single-results':
        return <SingleExperimentResults experimentData={currentExperimentData} onBack={() => setActiveSection('parameters')} />;
      case 'batch-results':
        return <BatchResultsAnalysis />;
      case 'history':
        return <ExperimentHistory />;
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
      'creative-analysis': 'Creative Writing Analysis',
      intelligence: 'AI Insights',
      datasets: 'Dataset Manager',
      export: 'Export & Reports',
      optimization: 'Auto-Optimizer',
      models: 'Model Management',
      presets: 'Parameter Presets',
      settings: 'Settings',
      'single-results': 'Experiment Results',
      'batch-results': 'Batch Analysis',
      'history': 'Experiment History'
    };
    return titles[activeSection] || 'Dashboard';
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white/95 backdrop-blur-sm border-r border-white/20">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 hover:bg-white/30"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <XMarkIcon className="h-5 w-5 text-white" />
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
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile menu button - positioned as floating button */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 p-2.5 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 text-gray-700 hover:text-blue-600 hover:bg-white transition-all duration-200 hover:scale-105"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        {/* Main Content Area - Full Height */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {renderActiveSection()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnhancedDashboardLayout;
