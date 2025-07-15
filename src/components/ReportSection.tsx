import React from 'react';
import { FileBarChart, Download } from 'lucide-react';
import Select from 'react-select';
import { LocationOption } from '../types';

interface ReportSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  locations: LocationOption[];
  selectedLocations: LocationOption[];
  onLocationChange: (locations: LocationOption[]) => void;
  onGenerateReport: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  canGenerate: boolean;
}

const ReportSection: React.FC<ReportSectionProps> = ({
  title,
  description,
  icon,
  locations,
  selectedLocations,
  onLocationChange,
  onGenerateReport,
  onExportPDF,
  onExportExcel,
  canGenerate
}) => {
  const handleSelectAll = () => {
    onLocationChange(locations);
  };

  const handleClearAll = () => {
    onLocationChange([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      <p className="text-gray-600 mb-4">{description}</p>
      
      {locations.length > 0 && (
        <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Select Locations</label>
          <div className="flex space-x-2">
            <button
              onClick={handleSelectAll}
              disabled={locations.length === 0 || selectedLocations.length === locations.length}
              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              disabled={selectedLocations.length === 0}
              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
        <Select
          isMulti
          options={locations}
          value={selectedLocations}
          onChange={(selected) => onLocationChange(selected as LocationOption[])}
          placeholder="Select locations..."
          className="text-sm"
          styles={{
            control: (base) => ({
              ...base,
              minHeight: '38px',
              borderColor: '#d1d5db',
              '&:hover': {
                borderColor: '#9ca3af'
              }
            }),
            multiValue: (base) => ({
              ...base,
              backgroundColor: '#e5e7eb',
              borderRadius: '4px'
            }),
            multiValueLabel: (base) => ({
              ...base,
              color: '#374151',
              fontSize: '12px'
            }),
            multiValueRemove: (base) => ({
              ...base,
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
                color: '#374151'
              }
            })
          }}
        />
        {selectedLocations.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {selectedLocations.length} of {locations.length} locations selected
          </p>
        )}
        </div>
      )}
      
      <div className="flex flex-col space-y-2">
        <button
          onClick={onGenerateReport}
          disabled={!canGenerate}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
        >
          <FileBarChart className="h-4 w-4" />
          <span>Generate Report</span>
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={onExportPDF}
            disabled={!canGenerate}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export PDF</span>
          </button>
          
          <button
            onClick={onExportExcel}
            disabled={!canGenerate}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportSection;