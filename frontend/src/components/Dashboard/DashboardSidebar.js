import React from 'react';
import { 
  HomeIcon,
  BeakerIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CpuChipIcon,
  SparklesIcon,
  Cog6ToothIcon,
  ChartPieIcon,
  ClockIcon,
  FolderIcon,
  BookOpenIcon,
  LightBulbIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  SquaresPlusIcon,
  AdjustmentsHorizontalIcon,
  PresentationChartBarIcon,
  CircleStackIcon,
  UserIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { designTokens } from '../../styles/designTokens';

const DashboardSidebar = ({ activeSection, onSectionChange, isCollapsed = false }) => {
  const menuSections = [
    {
      title: 'Overview',
      items: [
        {
          id: 'overview',
          name: 'Dashboard Home',
          icon: HomeIcon,
          description: 'Main overview and quick stats'
        },
        {
          id: 'recent',
          name: 'Recent Activity',
          icon: ClockIcon,
          description: 'Latest experiments and results'
        }
      ]
    },
    {
      title: 'Experimentation',
      items: [
        {
          id: 'parameters',
          name: 'Parameter Testing',
          icon: AdjustmentsHorizontalIcon,
          description: 'Configure and test LLM parameters',
          badge: 'Core'
        },
        {
          id: 'batch',
          name: 'Batch Experiments',
          icon: SquaresPlusIcon,
          description: 'Run multiple parameter combinations'
        },
        {
          id: 'presets',
          name: 'Parameter Presets',
          icon: BookOpenIcon,
          description: 'Saved parameter configurations'
        }
      ]
    },
    {
      title: 'Analysis & Insights',
      items: [
        {
          id: 'quality',
          name: 'Quality Metrics',
          icon: ChartBarIcon,
          description: 'Comprehensive quality analysis',
          badge: 'Pro'
        },
        {
          id: 'comparison',
          name: 'Response Comparison',
          icon: DocumentTextIcon,
          description: 'Side-by-side response analysis'
        },
        {
          id: 'analytics',
          name: 'Advanced Analytics',
          icon: PresentationChartBarIcon,
          description: 'Trends, correlations, and insights'
        },
        {
          id: 'intelligence',
          name: 'AI Insights',
          icon: SparklesIcon,
          description: 'AI-powered recommendations',
          badge: 'New'
        }
      ]
    },
    {
      title: 'Results & History',
      items: [
        {
          id: 'single-results',
          name: 'Experiment Results',
          icon: ChartPieIcon,
          description: 'Detailed individual experiment analysis'
        },
        {
          id: 'batch-results',
          name: 'Batch Analysis',
          icon: ArrowTrendingUpIcon,
          description: 'Comprehensive batch experiment insights'
        },
        {
          id: 'history',
          name: 'Experiment History',
          icon: ClockIcon,
          description: 'Browse and manage all experiments'
        }
      ]
    },
    {
      title: 'Data & Export',
      items: [
        {
          id: 'datasets',
          name: 'Dataset Manager',
          icon: CircleStackIcon,
          description: 'Manage test datasets and prompts'
        },
        {
          id: 'export',
          name: 'Export & Reports',
          icon: FolderIcon,
          description: 'Export results and generate reports'
        }
      ]
    },
    {
      title: 'Tools & Settings',
      items: [
        {
          id: 'optimization',
          name: 'Auto-Optimizer',
          icon: BoltIcon,
          description: 'Automated parameter optimization',
          badge: 'Beta'
        },
        {
          id: 'models',
          name: 'Model Management',
          icon: CpuChipIcon,
          description: 'Configure LLM providers and models'
        },
        {
          id: 'settings',
          name: 'Settings',
          icon: Cog6ToothIcon,
          description: 'Dashboard and application settings'
        }
      ]
    }
  ];

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Core': return 'bg-blue-100 text-blue-700';
      case 'Pro': return 'bg-purple-100 text-purple-700';
      case 'New': return 'bg-emerald-100 text-emerald-700';
      case 'Beta': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`h-full bg-white/80 backdrop-blur-sm border-r border-white/20 shadow-xl transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-sm">
            <CpuChipIcon className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-base font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">LLM Lab</h1>
              <p className="text-xs text-gray-600 font-medium">Analysis Platform</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="px-3">
            {!isCollapsed && (
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 px-2">
                {section.title}
              </h3>
            )}
            
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={`w-full flex items-center group transition-all duration-200 rounded-lg ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm border border-blue-200'
                        : 'text-gray-600 hover:text-blue-700 hover:bg-white/60'
                    } ${isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2.5'}`}
                    title={isCollapsed ? `${item.name} - ${item.description}` : undefined}
                  >
                    <Icon className={`flex-shrink-0 transition-transform duration-200 ${
                      isCollapsed ? 'w-5 h-5' : 'w-4 h-4'
                    } ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                    
                    {!isCollapsed && (
                      <>
                        <div className="flex-1 ml-3 text-left">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold">{item.name}</span>
                            {item.badge && (
                              <span className={`px-1.5 py-0.5 text-xs font-bold rounded-full ${getBadgeColor(item.badge)}`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 leading-tight line-clamp-1">{item.description}</p>
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Section */}
      <div className="p-3 border-t border-white/20">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 hover:from-emerald-100 hover:to-teal-100 transition-all duration-200 cursor-pointer">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-sm">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">User</p>
              <p className="text-xs text-emerald-700 font-medium">Pro Plan</p>
            </div>
          </div>
        ) : (
          <button className="w-full flex justify-center p-2.5 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 hover:from-emerald-100 hover:to-teal-100 transition-all duration-200">
            <UserIcon className="w-5 h-5 text-emerald-600" />
          </button>
        )}
      </div>

      {/* Help Section */}
      <div className="p-3">
        {!isCollapsed ? (
          <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <QuestionMarkCircleIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-blue-900">Need Help?</span>
            </div>
            <p className="text-xs text-blue-700 mb-3 leading-relaxed">
              Explore our comprehensive guide to maximize your LLM analysis workflow.
            </p>
            <button className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-sm hover:shadow-md">
              View Documentation
            </button>
          </div>
        ) : (
          <button className="w-full flex justify-center p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 hover:from-blue-100 hover:to-purple-100 transition-all duration-200">
            <QuestionMarkCircleIcon className="w-5 h-5 text-blue-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardSidebar;
