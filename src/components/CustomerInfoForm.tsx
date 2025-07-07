import React from 'react';
import { User, Upload, Save, Trash2, RotateCcw } from 'lucide-react';
import { CustomerInfo } from '../types';

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo;
  onCustomerInfoChange: (info: CustomerInfo) => void;
  onLogoUpload: (file: File) => void;
  onSaveEvent: () => void;
  onDeleteEvent: () => void;
  onClearAllEvents?: () => void;
  canSaveEvent: boolean;
  canDeleteEvent: boolean;
  totalSavedEvents: number;
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  customerInfo,
  onCustomerInfoChange,
  onLogoUpload,
  onSaveEvent,
  onDeleteEvent,
  onClearAllEvents,
  canSaveEvent,
  canDeleteEvent,
  totalSavedEvents
}) => {
  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    onCustomerInfoChange({
      ...customerInfo,
      [field]: value
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onLogoUpload(files[0]);
    }
  };

  const handleClearAll = () => {
    if (totalSavedEvents === 0) return;
    
    if (confirm(`Are you sure you want to delete all ${totalSavedEvents} saved events? This action cannot be undone.`)) {
      onClearAllEvents?.();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
          {totalSavedEvents > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {totalSavedEvents} saved event{totalSavedEvents !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          {totalSavedEvents > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors text-sm"
              title="Clear all saved events"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          )}
          
          {canDeleteEvent && (
            <button
              onClick={onDeleteEvent}
              className="flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Event</span>
            </button>
          )}
          
          <button
            onClick={onSaveEvent}
            disabled={!canSaveEvent}
            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <Save className="h-4 w-4" />
            <span>Save Event</span>
          </button>
        </div>
      </div>
      
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Instructions:</span> Enter Event ID and customer information below. 
          Click "Save Event\" to add this event to the dropdown for future use. Events are automatically saved to your browser and will persist across sessions.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event ID *</label>
          <input
            type="text"
            value={customerInfo.eventId}
            onChange={(e) => handleInputChange('eventId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Event ID (e.g., EVT001)"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
          <input
            type="text"
            value={customerInfo.customerName}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter customer name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
          <input
            type="text"
            value={customerInfo.customerId}
            onChange={(e) => handleInputChange('customerId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter customer ID"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Outlet Address</label>
          <textarea
            value={customerInfo.outletAddress}
            onChange={(e) => handleInputChange('outletAddress', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter outlet address"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Stock Count</label>
          <input
            type="date"
            value={customerInfo.dateOfStockCount}
            onChange={(e) => handleInputChange('dateOfStockCount', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time of Stock Count</label>
          <input
            type="time"
            value={customerInfo.timeOfStockCount}
            onChange={(e) => handleInputChange('timeOfStockCount', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name of ACREBIS Supervisor</label>
          <input
            type="text"
            value={customerInfo.acrebisSupervisor}
            onChange={(e) => handleInputChange('acrebisSupervisor', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter ACREBIS supervisor name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name of Customer Supervisor</label>
          <input
            type="text"
            value={customerInfo.customerSupervisor}
            onChange={(e) => handleInputChange('customerSupervisor', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter customer supervisor name"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Click to upload company logo</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="inline-block bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 cursor-pointer transition-colors"
            >
              Choose File
            </label>
            {customerInfo.companyLogo && (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">✓ Logo uploaded successfully</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoForm;