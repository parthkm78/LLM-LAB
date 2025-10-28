import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { exportAPI } from '../services/api';

const ExportButton = ({ experimentId, experimentName, disabled = false }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format) => {
    if (!experimentId) {
      toast.error('No experiment ID provided');
      return;
    }

    try {
      setExporting(true);
      
      if (format === 'csv') {
        // For CSV, we need to handle blob response
        const response = await fetch(`/api/export/${experimentId}/csv`);
        if (!response.ok) {
          throw new Error('Export failed');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${experimentName || 'experiment'}-${experimentId}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success('CSV exported successfully!');
      } else {
        // For JSON export
        const data = await exportAPI.exportExperiment(experimentId, format);
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${experimentName || 'experiment'}-${experimentId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success('JSON exported successfully!');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        disabled={disabled || exporting}
        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        onClick={() => {
          // Show dropdown menu
          const dropdown = document.getElementById(`export-dropdown-${experimentId}`);
          dropdown.classList.toggle('hidden');
        }}
      >
        <span>📥</span>
        <span>{exporting ? 'Exporting...' : 'Export'}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Dropdown Menu */}
      <div
        id={`export-dropdown-${experimentId}`}
        className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10"
      >
        <div className="py-1">
          <button
            onClick={() => {
              handleExport('json');
              document.getElementById(`export-dropdown-${experimentId}`).classList.add('hidden');
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Export as JSON
          </button>
          <button
            onClick={() => {
              handleExport('csv');
              document.getElementById(`export-dropdown-${experimentId}`).classList.add('hidden');
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Export as CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportButton;
