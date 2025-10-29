// Compact design utilities for the dashboard
export const compactStyles = {
  // Page containers
  pageContainer: 'min-h-screen bg-gray-50',
  
  // Headers - more compact
  header: 'bg-white border-b border-gray-200 px-4 py-3',
  headerTitle: 'text-lg font-bold text-gray-900',
  headerSubtitle: 'text-sm text-gray-600',
  
  // Content areas
  content: 'p-4 space-y-4',
  contentSection: 'space-y-3',
  
  // Cards - more compact
  card: 'bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-300',
  cardHeader: 'flex items-center justify-between mb-3',
  cardTitle: 'text-base font-semibold text-gray-900',
  cardSubtitle: 'text-sm text-gray-600',
  
  // Grids - tighter spacing
  gridTight: 'grid gap-3',
  gridMedium: 'grid gap-4',
  
  // Buttons - more compact
  button: 'px-3 py-1.5 rounded-lg font-medium transition-colors text-sm',
  buttonPrimary: 'bg-blue-600 text-white hover:bg-blue-700',
  buttonSecondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  buttonSuccess: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  
  // Forms - more compact
  input: 'px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm',
  select: 'px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm',
  
  // Metrics and stats
  metric: 'text-center p-3',
  metricValue: 'text-lg font-bold',
  metricLabel: 'text-xs text-gray-500 mt-1',
  
  // Lists
  listItem: 'py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors',
  
  // Tabs - more compact
  tabContainer: 'flex space-x-1',
  tab: 'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-sm',
  tabActive: 'bg-blue-100 text-blue-700 shadow-sm',
  tabInactive: 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
};

// Responsive grid classes for compact design
export const compactGrids = {
  cols1: 'grid-cols-1',
  cols2: 'grid-cols-1 md:grid-cols-2',
  cols3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  cols4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  cols6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
};

// Component-specific compact styles
export const compactComponents = {
  // Sidebar
  sidebarWidth: 'w-64', // Reduced from w-72
  sidebarPadding: 'p-3', // Reduced from p-6
  sidebarItem: 'px-2.5 py-2', // Reduced from px-3 py-2.5
  
  // Dashboard cards
  dashboardCard: 'bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-300',
  statCard: 'bg-white rounded-lg border border-gray-200 p-4',
  
  // Forms
  formGroup: 'space-y-2', // Reduced from space-y-4
  formRow: 'grid grid-cols-1 md:grid-cols-2 gap-3', // Reduced gap
  
  // Modal
  modal: 'bg-white rounded-xl shadow-2xl max-w-2xl w-full m-4',
  modalHeader: 'px-6 py-4 border-b border-gray-200',
  modalBody: 'px-6 py-4',
  modalFooter: 'px-6 py-4 border-t border-gray-200 flex justify-end space-x-3'
};

// Helper function to combine classes
export const cx = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
