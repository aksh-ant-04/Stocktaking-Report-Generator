import * as XLSX from 'xlsx';
import { ProductItemMaster, ScanData } from '../types';

export const processExcelFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

export const validateProductMasterData = (data: any[]): ProductItemMaster[] => {
  const requiredFields = ['Bu_Code', 'BU_ID', 'Worksheet_ID', 'Inventory_Item_ID', 'Item_Type', 'Category', 'Pur_Ret_UPC', 'Item_Description', 'UOM', 'Multiplier'];
  
  return data.filter(row => {
    return requiredFields.every(field => row.hasOwnProperty(field));
  }).map(row => ({
    Bu_Code: String(row.Bu_Code || ''),
    BU_ID: String(row.BU_ID || ''),
    Worksheet_ID: String(row.Worksheet_ID || ''),
    Inventory_Item_ID: String(row.Inventory_Item_ID || ''),
    Item_Type: String(row.Item_Type || ''),
    Category: String(row.Category || ''),
    Pur_Ret_UPC: String(row.Pur_Ret_UPC || ''),
    Item_Description: String(row.Item_Description || ''),
    UOM: String(row.UOM || ''),
    Multiplier: Number(row.Multiplier || 0)
  }));
};

export const validateScanData = (data: any[]): ScanData[] => {
  const requiredFields = ['Sheet Name', 'Location', 'Item Barcode', 'Quantity', 'Date'];
  
  return data.filter(row => {
    return requiredFields.every(field => row.hasOwnProperty(field));
  }).map(row => ({
    'Sheet Name': String(row['Sheet Name'] || ''),
    'Not Going to Use': String(row['Not Going to Use'] || ''),
    Location: String(row.Location || ''),
    'Item Barcode': String(row['Item Barcode'] || ''),
    Quantity: Number(row.Quantity || 0),
    'Audited Quantity': Number(row['Audited Quantity'] || 0),
    Date: String(row.Date || '')
  }));
};

export const getUniqueLocations = (scanData: ScanData[]) => {
  const locations = [...new Set(scanData.map(item => item.Location))];
  return locations.filter(location => location.trim() !== '').map(location => ({
    value: location,
    label: location
  }));
};