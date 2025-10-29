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
    <div className={`h-full bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <CpuChipIcon className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-base font-bold text-gray-900">LLM Lab</h1>
              <p className="text-xs text-gray-500">Analysis Platform</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2 space-y-4">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="px-2">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                {section.title}
              </h3>
            )}
            
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={`w-full flex items-center group transition-all duration-200 rounded-lg ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                    } ${isCollapsed ? 'px-2 py-2.5 justify-center' : 'px-2.5 py-2'}`}
                    title={isCollapsed ? `${item.name} - ${item.description}` : undefined}
                  >
                    <Icon className={`flex-shrink-0 transition-transform duration-200 ${
                      isCollapsed ? 'w-5 h-5' : 'w-4 h-4'
                    } ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                    
                    {!isCollapsed && (
                      <>
                        <div className="flex-1 ml-2.5 text-left">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-sm font-medium">{item.name}</span>
                            {item.badge && (
                              <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${getBadgeColor(item.badge)}`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 leading-tight">{item.description}</p>
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
      <div className="p-3 border-t border-gray-100">
        {!isCollapsed ? (
          <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">User</p>
              <p className="text-xs text-gray-500">Pro Plan</p>
            </div>
          </div>
        ) : (
          <button className="w-full flex justify-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <UserIcon className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Help/Support */}
      <div className="p-3 border-t border-gray-100">
        {!isCollapsed ? (
          <button className="w-full flex items-center space-x-2 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm">
            <QuestionMarkCircleIcon className="w-4 h-4" />
            <span>Help & Support</span>
          </button>
        ) : (
          <button className="w-full flex justify-center p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <QuestionMarkCircleIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Help Section */}
      <div className="p-4">
        {!isCollapsed ? (
          <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <div className="flex items-center space-x-2 mb-2">
              <QuestionMarkCircleIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Need Help?</span>
            </div>
            <p className="text-xs text-blue-700 mb-3">
              Explore our comprehensive guide to maximize your LLM analysis workflow.
            </p>
            <button className="w-full px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
              View Documentation
            </button>
          </div>
        ) : (
          <button className="w-full flex justify-center p-2 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
            <QuestionMarkCircleIcon className="w-6 h-6 text-blue-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardSidebar;
