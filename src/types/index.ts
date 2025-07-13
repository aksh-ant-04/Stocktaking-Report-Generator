export interface ProductItemMaster {
  Bu_Code: string;
  BU_ID: string;
  Worksheet_ID: string;
  Inventory_Item_ID: string;
  Item_Type: string;
  Category: string;
  Pur_Ret_UPC: string;
  Item_Description: string;
  UOM: string;
  Multiplier: number;
}

export interface ScanData {
  'Sheet Name': string;
  'Not Going to Use': string;
  Location: string;
  'Item Barcode': string;
  Quantity: number;
  'Audited Quantity': number;
  Date: string;
}

export interface CustomerInfo {
  eventId: string;
  customerName: string;
  customerId: string;
  outletAddress: string;
  dateOfStockCount: string;
  timeOfStockCount: string;
  totalStocktakeLocations: string;
  acrebisSupervisor: string;
  customerSupervisor: string;
  companyLogo?: string;
}

export interface EventData {
  eventId: string;
  customerName: string;
  customerId: string;
  outletAddress: string;
  dateOfStockCount: string;
  timeOfStockCount: string;
  totalStocktakeLocations: string;
  acrebisSupervisor: string;
  customerSupervisor: string;
  companyLogo?: string;
}

export interface LocationWiseReportItem {
  Pur_Ret_UPC: string;
  Inventory_Item_ID: string;
  Item_Description: string;
  Location: string;
  Quantity: number;
  Date: string;
}

export interface ConsolidatedReportItem {
  Location: string;
  Quantity: number;
  Date: string;
}

export interface LocationOption {
  value: string;
  label: string;
}