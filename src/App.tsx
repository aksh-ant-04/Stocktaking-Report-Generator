import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import EventSelector from './components/EventSelector';
import FileUpload from './components/FileUpload';
import CustomerInfoForm from './components/CustomerInfoForm';
import ReportSection from './components/ReportSection';
import { FileBarChart, MapPin, BarChart3 } from 'lucide-react';
import { 
  ProductItemMaster, 
  ScanData, 
  CustomerInfo, 
  LocationOption,
  LocationWiseReportItem,
  ConsolidatedReportItem
} from './types';
import { 
  processExcelFile, 
  validateProductMasterData, 
  validateScanData, 
  getUniqueLocations 
} from './utils/fileProcessing';
import { 
  generateLocationWiseReport, 
  generateConsolidatedReport 
} from './utils/reportGeneration';
import {
  exportLocationWiseToPDF,
  exportConsolidatedToPDF,
  exportLocationWiseToExcel,
  exportConsolidatedToExcel
} from './utils/exportUtils';
import { getAllEvents, getEventById, addEvent, removeEvent, clearAllEvents } from './utils/eventData';

function App() {
  // Event and customer states
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    eventId: '',
    customerName: '',
    customerId: '',
    outletAddress: '',
    dateOfStockCount: '',
    timeOfStockCount: '',
    totalStocktakeLocations: '',
    acrebisSupervisor: '',
    customerSupervisor: '',
    companyLogo: ''
  });
  
  // File states
  const [productMasterFile, setProductMasterFile] = useState<File>();
  const [scanDataFile, setScanDataFile] = useState<File>();
  const [productMasterData, setProductMasterData] = useState<ProductItemMaster[]>([]);
  const [scanData, setScanData] = useState<ScanData[]>([]);
  
  // Report states
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [selectedLocationWiseLocations, setSelectedLocationWiseLocations] = useState<LocationOption[]>([]);
  const [selectedConsolidatedLocations, setSelectedConsolidatedLocations] = useState<LocationOption[]>([]);
  const [locationWiseReport, setLocationWiseReport] = useState<LocationWiseReportItem[]>([]);
  const [consolidatedReport, setConsolidatedReport] = useState<ConsolidatedReportItem[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    productMaster: false,
    scanData: false,
    locationWise: false,
    consolidated: false
  });
  //Reset Dashboard
  const resetDashboard = () => {
    setSelectedEventId('');
    setCustomerInfo({
      eventId: '',
      customerName: '',
      customerId: '',
      outletAddress: '',
      dateOfStockCount: '',
      timeOfStockCount: '',
      totalStocktakeLocations: '',
      acrebisSupervisor: '',
      customerSupervisor: '',
      companyLogo: ''
    });

    setProductMasterFile(undefined);
    setScanDataFile(undefined);
    setProductMasterData([]);
    setScanData([]);

    setLocations([]);
    setSelectedLocationWiseLocations([]);
    setSelectedConsolidatedLocations([]);
    setLocationWiseReport([]);
    setConsolidatedReport([]);

    setLoading({
      productMaster: false,
      scanData: false,
      locationWise: false,
      consolidated: false
    });
  };
  // Handle event selection
  const handleEventSelect = useCallback((eventId: string) => {
    setSelectedEventId(eventId);
    
    if (eventId) {
      const eventData = getEventById(eventId);
      if (eventData) {
        setCustomerInfo({
          eventId: eventData.eventId,
          customerName: eventData.customerName,
          customerId: eventData.customerId,
          outletAddress: eventData.outletAddress,
          dateOfStockCount: eventData.dateOfStockCount,
          timeOfStockCount: eventData.timeOfStockCount,
          totalStocktakeLocations: eventData.totalStocktakeLocations,
          acrebisSupervisor: eventData.acrebisSupervisor,
          customerSupervisor: eventData.customerSupervisor,
          companyLogo: eventData.companyLogo || '' // Load saved logo or empty string
        });
      }
    }
    // Don't reset customer info when deselecting - allow manual entry
  }, []);

  // Handle saving event
  const handleSaveEvent = useCallback(() => {
    if (!customerInfo.eventId.trim() || !customerInfo.customerName.trim()) {
      alert('Please enter at least Event ID and Customer Name to save the event.');
      return;
    }

    const eventData = {
      eventId: customerInfo.eventId,
      customerName: customerInfo.customerName,
      customerId: customerInfo.customerId,
      outletAddress: customerInfo.outletAddress,
      dateOfStockCount: customerInfo.dateOfStockCount,
      timeOfStockCount: customerInfo.timeOfStockCount,
      totalStocktakeLocations: customerInfo.totalStocktakeLocations,
      acrebisSupervisor: customerInfo.acrebisSupervisor,
      customerSupervisor: customerInfo.customerSupervisor,
      companyLogo: customerInfo.companyLogo
    };

    addEvent(eventData);
    setSelectedEventId(customerInfo.eventId);
    alert('Event saved successfully! It will now appear in the dropdown menu and persist across sessions.');
  }, [customerInfo]);

  // Handle deleting event
  const handleDeleteEvent = useCallback(() => {
    if (!selectedEventId) return;
    
    if (confirm(`Are you sure you want to delete event "${selectedEventId}"?`)) {
      removeEvent(selectedEventId);
      setSelectedEventId('');
      alert('Event deleted successfully!');
    }
  }, [selectedEventId]);

  // Handle clearing all events
  const handleClearAllEvents = useCallback(() => {
    clearAllEvents();
    setSelectedEventId('');
    alert('All events have been cleared successfully!');
  }, []);

  // Handle product master file upload
  const handleProductMasterUpload = useCallback(async (file: File) => {
    if (!customerInfo.eventId.trim()) return;
    
    setProductMasterFile(file);
    setLoading(prev => ({ ...prev, productMaster: true }));
    
    try {
      const data = await processExcelFile(file);
      const validatedData = validateProductMasterData(data);
      setProductMasterData(validatedData);
      console.log(`Loaded ${validatedData.length} product master records`);
    } catch (error) {
      console.error('Error processing product master file:', error);
      alert('Error processing product master file. Please check the file format.');
    } finally {
      setLoading(prev => ({ ...prev, productMaster: false }));
    }
  }, [customerInfo.eventId]);

  // Handle scan data file upload
  const handleScanDataUpload = useCallback(async (file: File) => {
    if (!customerInfo.eventId.trim()) return;
    
    setScanDataFile(file);
    setLoading(prev => ({ ...prev, scanData: true }));
    
    try {
      const data = await processExcelFile(file);
      const validatedData = validateScanData(data);
      setScanData(validatedData);
      
      // Extract unique locations
      const uniqueLocations = getUniqueLocations(validatedData);
      setLocations(uniqueLocations);
      
      console.log(`Loaded ${validatedData.length} scan data records`);
      console.log(`Found ${uniqueLocations.length} unique locations`);
    } catch (error) {
      console.error('Error processing scan data file:', error);
      alert('Error processing scan data file. Please check the file format.');
    } finally {
      setLoading(prev => ({ ...prev, scanData: false }));
    }
  }, [customerInfo.eventId]);

  // Handle logo upload
  const handleLogoUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      setCustomerInfo(prev => ({
        ...prev,
        companyLogo: base64String
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  // Generate location wise report
  const handleGenerateLocationWiseReport = useCallback(() => {
    setLoading(prev => ({ ...prev, locationWise: true }));
    
    try {
      const report = generateLocationWiseReport(
        productMasterData,
        scanData,
        selectedLocationWiseLocations
      );
      setLocationWiseReport(report);
      console.log(`Generated location wise report with ${report.length} items`);
    } catch (error) {
      console.error('Error generating location wise report:', error);
      alert('Error generating location wise report.');
    } finally {
      setLoading(prev => ({ ...prev, locationWise: false }));
    }
  }, [productMasterData, scanData, selectedLocationWiseLocations]);

  // Generate consolidated report
  const handleGenerateConsolidatedReport = useCallback(() => {
    setLoading(prev => ({ ...prev, consolidated: true }));
    
    try {
      const report = generateConsolidatedReport(
        productMasterData,
        scanData,
        selectedConsolidatedLocations
      );
      setConsolidatedReport(report);
      console.log(`Generated consolidated report with ${report.length} items`);
    } catch (error) {
      console.error('Error generating consolidated report:', error);
      alert('Error generating consolidated report.');
    } finally {
      setLoading(prev => ({ ...prev, consolidated: false }));
    }
  }, [productMasterData, scanData, selectedConsolidatedLocations]);

  // Export functions
  const handleExportLocationWisePDF = useCallback(() => {
    if (locationWiseReport.length === 0) {
      alert('Please generate the location wise report first.');
      return;
    }
    exportLocationWiseToPDF(locationWiseReport, customerInfo, customerInfo.companyLogo);
  }, [locationWiseReport, customerInfo]);

  const handleExportLocationWiseExcel = useCallback(() => {
    if (locationWiseReport.length === 0) {
      alert('Please generate the location wise report first.');
      return;
    }
    exportLocationWiseToExcel(locationWiseReport, customerInfo);
  }, [locationWiseReport]);

  const handleExportConsolidatedPDF = useCallback(() => {
    if (consolidatedReport.length === 0) {
      alert('Please generate the consolidated report first.');
      return;
    }
    exportConsolidatedToPDF(consolidatedReport, customerInfo, customerInfo.companyLogo);
  }, [consolidatedReport, customerInfo]);

  const handleExportConsolidatedExcel = useCallback(() => {
    if (consolidatedReport.length === 0) {
      alert('Please generate the consolidated report first.');
      return;
    }
    exportConsolidatedToExcel(consolidatedReport, customerInfo);
  }, [consolidatedReport]);

  const canGenerateReports = productMasterData.length > 0 && scanData.length > 0 && customerInfo.eventId.trim();
  const hasEventId = Boolean(customerInfo.eventId.trim());
  const canSaveEvent = Boolean(customerInfo.eventId.trim() && customerInfo.customerName.trim());
  const canDeleteEvent = Boolean(selectedEventId && getAllEvents().some(e => e.eventId === selectedEventId));
  const totalSavedEvents = getAllEvents().length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 🔁 Refresh Button */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={resetDashboard}
            className="bg-yellow-500 text-white font-semibold px-4 py-2 rounded hover:bg-yellow-600 shadow"
          >
            Reset Dashboard
          </button>
        </div>
        {/* Event Selection */}
        <EventSelector
          events={getAllEvents()}
          selectedEventId={selectedEventId}
          onEventSelect={handleEventSelect}
        />

        {/* Customer Information Section */}
        <div className="mb-8">
          <CustomerInfoForm
            customerInfo={customerInfo}
            onCustomerInfoChange={setCustomerInfo}
            onLogoUpload={handleLogoUpload}
            onSaveEvent={handleSaveEvent}
            onDeleteEvent={handleDeleteEvent}
            onClearAllEvents={handleClearAllEvents}
            canSaveEvent={canSaveEvent}
            canDeleteEvent={canDeleteEvent}
            totalSavedEvents={totalSavedEvents}
          />
        </div>

        {/* File Upload Section - Only shown when Event ID is entered */}
        {hasEventId && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Import Excel Files</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FileUpload
                title="PRODUCT ITEM MASTER"
                description="Drag and Drop PRODUCT ITEM MASTER file"
                requiredFields="Pur_Ret_UPC, Inventory_Item_ID, Item_Description"
                onFileUpload={handleProductMasterUpload}
                onFileReset={() => {
                  setProductMasterFile(undefined);
                  setProductMasterData([]);
                }}
                uploadedFile={productMasterFile}
                color="blue"
                disabled={!hasEventId}
              />
              
              <FileUpload
                title="SCAN DATA"
                description="Drag and Drop SCAN DATA file"
                requiredFields="Location, Item Barcode, Quantity"
                onFileUpload={handleScanDataUpload}
                onFileReset={() => {
                  setScanDataFile(undefined) //added for reset
                  setScanData([]);
                }} 
                uploadedFile={scanDataFile}
                color="green"
                disabled={!hasEventId}
              />
            </div>
          </div>
        )}

        {/* Reports Section - Only shown when files are uploaded */}
        {canGenerateReports && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ReportSection
              title="LOCATION WISE REPORT"
              description="Generate a detailed report based on location sorted on basis of timestamp"
              icon={<MapPin className="h-5 w-5 text-blue-600" />}
              locations={locations}
              selectedLocations={selectedLocationWiseLocations}
              onLocationChange={setSelectedLocationWiseLocations}
              onGenerateReport={handleGenerateLocationWiseReport}
              onExportPDF={handleExportLocationWisePDF}
              onExportExcel={handleExportLocationWiseExcel}
              canGenerate={canGenerateReports}
            />
            
            <ReportSection
              title="CONSOLIDATED REPORT"
              description="Generate report of all objects held at a particular location"
              icon={<BarChart3 className="h-5 w-5 text-purple-600" />}
              locations={locations}
              selectedLocations={selectedConsolidatedLocations}
              onLocationChange={setSelectedConsolidatedLocations}
              onGenerateReport={handleGenerateConsolidatedReport}
              onExportPDF={handleExportConsolidatedPDF}
              onExportExcel={handleExportConsolidatedExcel}
              canGenerate={canGenerateReports}
            />
          </div>
        )}

        {/* Status Information */}
        {(productMasterData.length > 0 || scanData.length > 0 || hasEventId) && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-900">Current Event ID</p>
                <p className="text-xl font-bold text-blue-600 truncate">{customerInfo.eventId || 'None'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-medium text-green-900">Product Master Records</p>
                <p className="text-2xl font-bold text-green-600">{productMasterData.length}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="font-medium text-purple-900">Scan Data Records</p>
                <p className="text-2xl font-bold text-purple-600">{scanData.length}</p>
              </div>
	      <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="font-medium text-indigo-900">Total Stocktake Locations</p>
                <p className="text-2xl font-bold text-indigo-600">{customerInfo.totalStocktakeLocations || '0'}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="font-medium text-orange-900">Total Completed Locations</p>
                <p className="text-2xl font-bold text-orange-600">{locations.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicators */}
        {Object.values(loading).some(Boolean) && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border-l-4 border-blue-500">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium text-gray-700">Processing...</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;