import {
  ProductItemMaster,
  ScanData,
  LocationWiseReportItem,
  ConsolidatedReportItem,
  NOFReportItem,
  LocationOption,
  BarcodeWiseReportItem
} from '../types';

// Enhanced date parsing function to handle multiple timestamp formats
const parseTimestamp = (dateStr: string): number => {
  if (!dateStr || dateStr.trim() === '') return Infinity;
  
  const cleanDateStr = dateStr.trim();
  
  // Try different date formats commonly found in Excel exports
  const formats = [
    // ISO format: 2024-01-15T10:30:00
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    // Date with time: 2024-01-15 10:30:00
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/,
    // Date with time (dots): 2024.01.15 10:30:00
    /^\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}:\d{2}/,
    // Date with time (slashes): 01/15/2024 10:30:00
    /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/,
    // Date with time (slashes): 15/01/2024 10:30:00
    /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/,
    // Excel serial date number (days since 1900-01-01)
    /^\d+(\.\d+)?$/
  ];
  
  let timestamp: number;
  
  // Handle Excel serial date numbers
  if (/^\d+(\.\d+)?$/.test(cleanDateStr)) {
    const excelDate = parseFloat(cleanDateStr);
    // Excel epoch starts from 1900-01-01, but Excel incorrectly treats 1900 as a leap year
    // So we need to subtract 2 days (1 for the leap year bug, 1 for 0-indexing)
    const excelEpoch = new Date(1900, 0, 1).getTime();
    timestamp = excelEpoch + (excelDate - 2) * 24 * 60 * 60 * 1000;
  } else {
    // Try parsing with dots replaced by dashes
    let normalizedDate = cleanDateStr.replace(/\./g, '-');
    
    // Handle DD/MM/YYYY format by converting to YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}/.test(normalizedDate)) {
      const parts = normalizedDate.split(/[\/\s]/);
      if (parts.length >= 3) {
        // Assume DD/MM/YYYY format (common in many regions)
        normalizedDate = `${parts[2]}-${parts[1]}-${parts[0]}${parts.length > 3 ? ' ' + parts.slice(3).join(' ') : ''}`;
      }
    }
    
    // Handle MM/DD/YYYY format (US format) - this is tricky to distinguish from DD/MM/YYYY
    // We'll use a heuristic: if day > 12, it's likely DD/MM/YYYY, otherwise assume MM/DD/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(cleanDateStr)) {
      const parts = cleanDateStr.split(/[\/\s]/);
      if (parts.length >= 3) {
        const firstNum = parseInt(parts[0]);
        const secondNum = parseInt(parts[1]);
        if (firstNum > 12) {
          // Definitely DD/MM/YYYY
          normalizedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}${parts.length > 3 ? ' ' + parts.slice(3).join(' ') : ''}`;
        } else if (secondNum > 12) {
          // Definitely MM/DD/YYYY
          normalizedDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}${parts.length > 3 ? ' ' + parts.slice(3).join(' ') : ''}`;
        } else {
          // Ambiguous - default to DD/MM/YYYY (more common internationally)
          normalizedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}${parts.length > 3 ? ' ' + parts.slice(3).join(' ') : ''}`;
        }
      }
    }
    
    // Ensure the date string has a 'T' separator for ISO format if it has both date and time
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(normalizedDate)) {
      normalizedDate = normalizedDate.replace(' ', 'T');
    }
    
    // Try parsing the normalized date
    timestamp = new Date(normalizedDate).getTime();
    
    // If that fails, try the original string
    if (isNaN(timestamp)) {
      timestamp = new Date(cleanDateStr).getTime();
    }
  }
  
  // Return Infinity for invalid dates to push them to the end
  return isNaN(timestamp) ? Infinity : timestamp;
};

export const generateLocationWiseReport = (
  productMaster: ProductItemMaster[],
  scanData: ScanData[],
  selectedLocations: LocationOption[]
): LocationWiseReportItem[] => {
  const locationValues = selectedLocations.map(loc => loc.value);
  const filteredScanData = scanData.filter(scan =>
    locationValues.length === 0 || locationValues.includes(scan.Location)
  );

  const matchedData: LocationWiseReportItem[] = [];
  
  filteredScanData.forEach(scan => {
    const matchedProduct = productMaster.find(product =>
      product.Pur_Ret_UPC === scan['Item Barcode']
    );
    
    if (matchedProduct) {
      // Add matched product with full details
      matchedData.push({
        Pur_Ret_UPC: matchedProduct.Pur_Ret_UPC,
        Inventory_Item_ID: matchedProduct.Inventory_Item_ID,
        Item_Description: matchedProduct.Item_Description,
        Location: scan.Location,
        Quantity: scan.Quantity,
        Date: scan.Date
      });
    } else {
      // Add unmatched item with "Barcode Not in Item Master" message
      matchedData.push({
        Pur_Ret_UPC: scan['Item Barcode'],
        Inventory_Item_ID: '', // Empty for unmatched items
        Item_Description: 'Barcode Not in Item Master',
        Location: scan.Location,
        Quantity: scan.Quantity,
        Date: scan.Date
      });
    }
  });

  // Sort by location first, then by timestamp within each location (ascending order)
  matchedData.sort((a, b) => {
    // First sort by location
    if (a.Location !== b.Location) {
      return a.Location.localeCompare(b.Location);
    }
    
    // Then sort by timestamp within the same location (ascending order - earliest first)
    const timestampA = parseTimestamp(a.Date);
    const timestampB = parseTimestamp(b.Date);
    
    return timestampA - timestampB;
  });

  return matchedData;
};

export const generateConsolidatedReport = (
  productMaster: ProductItemMaster[],
  scanData: ScanData[],
  selectedLocations: LocationOption[]
): ConsolidatedReportItem[] => {
  const locationValues = selectedLocations.map(loc => loc.value);
  const filteredScanData = scanData.filter(scan =>
    locationValues.length === 0 || locationValues.includes(scan.Location)
  );

  const locationTotals: Record<string, number> = {};
  filteredScanData.forEach(scan => {
    locationTotals[scan.Location] = (locationTotals[scan.Location] || 0) + scan.Quantity;
  });

  return Object.entries(locationTotals).map(([Location, Quantity]) => ({
    Location,
    Quantity,
    Date: '' // Not needed for consolidated report
  }));
};
export const generateNOFReport = (
  productMaster: ProductItemMaster[],
  scanData: ScanData[],
  selectedLocations: LocationOption[]
): NOFReportItem[] => {
  const locationValues = selectedLocations.map(loc => loc.value);
  const filteredScanData = scanData.filter(scan =>
    locationValues.length === 0 || locationValues.includes(scan.Location)
  );

  const nofData: NOFReportItem[] = [];
  
  filteredScanData.forEach(scan => {
    const matchedProduct = productMaster.find(product =>
      product.Pur_Ret_UPC === scan['Item Barcode']
    );
    
    // Only include items that are NOT found in the product master
    if (!matchedProduct) {
      nofData.push({
        Item_Barcode: scan['Item Barcode'],
        Location: scan.Location,
        Quantity: scan.Quantity,
        Date: scan.Date
      });
    }
  });

  // Sort by location first, then by timestamp within each location (ascending order)
  nofData.sort((a, b) => {
    // First sort by location
    if (a.Location !== b.Location) {
      return a.Location.localeCompare(b.Location);
    }
    
    // Then sort by timestamp within the same location (ascending order - earliest first)
    const timestampA = parseTimestamp(a.Date);
    const timestampB = parseTimestamp(b.Date);
    
    return timestampA - timestampB;
  });

  return nofData;
};

export const generateBarcodeWiseReport = (
  productMaster: ProductItemMaster[],
  scanData: ScanData[]
): BarcodeWiseReportItem[] => {
  // Aggregate quantities by barcode across all locations
  const barcodeToQuantity: Record<string, number> = {};
  scanData.forEach((scan) => {
    const barcode = scan['Item Barcode'];
    barcodeToQuantity[barcode] = (barcodeToQuantity[barcode] || 0) + scan.Quantity;
  });

  // Map to final records by looking up item master details
  const results: BarcodeWiseReportItem[] = Object.entries(barcodeToQuantity).map(([barcode, qty]) => {
    const matchedProduct = productMaster.find((p) => p.Pur_Ret_UPC === barcode);
    
    return {
      Pur_Ret_UPC: barcode,
      Inventory_Item_ID: matchedProduct ? matchedProduct.Inventory_Item_ID : '',
      Item_Description: matchedProduct ? matchedProduct.Item_Description : 'Barcode Not in Item Master',
      Quantity: qty
    };
  });

  // Sort by barcode for consistency
  results.sort((a, b) => a.Pur_Ret_UPC.localeCompare(b.Pur_Ret_UPC));
  return results;
};