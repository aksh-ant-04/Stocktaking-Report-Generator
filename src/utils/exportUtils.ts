import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { LocationWiseReportItem, ConsolidatedReportItem, CustomerInfo } from '../types';

const getFormattedTimestamp = () => {
  const now = new Date();
  return now.toLocaleString();
};

const renderCustomerInfoTable = (doc: any, customerInfo: CustomerInfo, startY = 30) => {
  const tableBody = [
    [
      { content: 'Customer Name', styles: { halign: 'left', fillColor: [240, 240, 240], fontStyle: 'bold' } },
      customerInfo.customerName || '',
      { content: 'Date of Stock Take', styles: { halign: 'left', fillColor: [240, 240, 240], fontStyle: 'bold' } },
      customerInfo.dateOfStockCount || ''
    ],
    [
      { content: 'Customer ID', styles: { halign: 'left', fillColor: [240, 240, 240], fontStyle: 'bold' } },
      customerInfo.customerId || '',
      { content: 'Time of Stock Take', styles: { halign: 'left', fillColor: [240, 240, 240], fontStyle: 'bold' } },
      customerInfo.timeOfStockCount || ''
    ],
    [
      { content: 'Outlet Address', styles: { halign: 'left', fillColor: [240, 240, 240], fontStyle: 'bold' } },
      { content: customerInfo.outletAddress || '', colSpan: 3 }
    ],
    [
      { content: 'ACREBIS Supervisor', styles: { halign: 'left', fillColor: [240, 240, 240], fontStyle: 'bold' } },
      customerInfo.acrebisSupervisor || '',
      { content: 'Customer Supervisor', styles: { halign: 'left', fillColor: [240, 240, 240], fontStyle: 'bold' } },
      customerInfo.customerSupervisor || ''
    ]
  ];

  doc.autoTable({
    startY,
    head: [],
    body: tableBody,
    theme: 'grid',
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 55 },
      2: { cellWidth: 35 },
      3: { cellWidth: 55 }
    },
    margin: { left: 15, right: 15 },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.1
  });
};

const addHeaderToPage = (doc: any, reportTitle: string, companyLogo?: string) => {
  // Add company logo if available
  if (companyLogo) {
    try {
      doc.addImage(companyLogo, 'JPEG', 15, 10, 15, 15);
    } catch (error) {
      console.warn('Failed to add logo to PDF:', error);
    }
  }

  // Add acrebis branding
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 0, 0);
  doc.text('acrebis', doc.internal.pageSize.width - 35, 20);

  // Add report title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(reportTitle, doc.internal.pageSize.width / 2, 22, { align: 'center' });
};

export const exportLocationWiseToPDF = (data: LocationWiseReportItem[], customerInfo: CustomerInfo, companyLogo?: string) => {
  const doc = new jsPDF();
  const reportTitle = 'LOCATION WISE REPORT';
  const finalData: any[] = [];
  const locations = [...new Set(data.map(d => d.Location))];

  locations.forEach(location => {
    const locationRows = data.filter(d => d.Location === location);
    finalData.push([{
      content: `Location: ${location}`,
      colSpan: 5,
      styles: { fontStyle: 'bold', fillColor: [200, 200, 255] }
    }]);

    locationRows.forEach(item => {
      finalData.push([
        item.Pur_Ret_UPC,
        item.Inventory_Item_ID,
        item.Item_Description,
        item.Location,
        item.Quantity.toString()
      ]);
    });

    const subtotal = locationRows.reduce((sum, item) => sum + item.Quantity, 0);
    finalData.push([{
      content: `Subtotal for ${location}: ${subtotal}`,
      colSpan: 5,
      styles: { fontStyle: 'bold', fillColor: [220, 220, 220], halign: 'center'}
    }]);
  });

  const grandTotal = data.reduce((sum, d) => sum + d.Quantity, 0);
  finalData.push([{
    content: `Grand Total: ${grandTotal}`,
    colSpan: 5,
    styles: { fontStyle: 'bold', fillColor: [180, 255, 180], halign: 'center'}
  }]);

  doc.autoTable({
    startY: 58,
    head: [['Pur_Ret_UPC', 'Inventory_Item_ID', 'Item_Description', 'Location', 'Quantity']],
    body: finalData,
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], 4: { halign: 'center' } },
    styles: { fontSize: 8 },
    columnStyles: {
      4: { halign: 'center' } // Center align Quantity column
    },
    margin: { top: 58 },
    didParseCell: function (data) {
      // Target only the "Quantity" header cell
      if (data.section === 'head' && data.column.index === 4) {
        data.cell.styles.halign = 'center';
      }
    },
    didDrawPage: function (data) {
      // Add header to every page
      addHeaderToPage(doc, reportTitle, companyLogo);
      // Add customer info table to every page  
      renderCustomerInfoTable(doc, customerInfo, 28);

      const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
      const pageCount = doc.internal.getNumberOfPages();
      const ts = getFormattedTimestamp();
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Generated: ${ts} | Page ${pageNumber}`, 15, doc.internal.pageSize.height - 10);
    }
  });

  doc.save('location-wise-report.pdf');
};

export const exportConsolidatedToPDF = (data: ConsolidatedReportItem[], customerInfo: CustomerInfo, companyLogo?: string) => {
  const doc = new jsPDF();
  const reportTitle = 'CONSOLIDATED REPORT';
  const grandTotal = data.reduce((sum, d) => sum + d.Quantity, 0);
  const tableData: any[] = data.map(d => [d.Location, d.Quantity.toString()]);
  tableData.push([
    { content: `Grand Total: ${grandTotal}`, colSpan: 2, styles: { fontStyle: 'bold', fillColor: [180, 255, 180], halign: 'center'} }
  ]);

  doc.autoTable({
    startY: 58,
    head: [['Location', 'Quantity']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255]},
    columnStyles: {
      1: { halign: 'center' } // Center align Quantity column and header
    },
    styles: { fontSize: 8 },
    margin: { top: 58 },
    didParseCell: function (data) {
      // Target only the "Quantity" header cell
      if (data.section === 'head' && data.column.index === 1) {
        data.cell.styles.halign = 'center';
      }
    },
    didDrawPage: function (data) {
      // Add header to every page
      addHeaderToPage(doc, reportTitle, companyLogo);
      // Add customer info table to every page
      renderCustomerInfoTable(doc, customerInfo, 28);
      const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
      const pageCount = doc.internal.getNumberOfPages();
      const ts = getFormattedTimestamp();
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Generated: ${ts} | Page ${pageNumber}`, 15, doc.internal.pageSize.height - 10);
    }
  });

  doc.save('consolidated-report.pdf');
};

export const exportLocationWiseToExcel = (data: LocationWiseReportItem[], customerInfo: CustomerInfo) => {
  try {
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Prepare customer information data
    const customerData = [
      ['Customer Information', '', '', ''],
      ['Customer Name', customerInfo.customerName || '', 'Date of Stock Take', customerInfo.dateOfStockCount || ''],
      ['Customer ID', customerInfo.customerId || '', 'Time of Stock Take', customerInfo.timeOfStockCount || ''],
      ['Outlet Address', customerInfo.outletAddress || '', '', ''],
      ['ACREBIS Supervisor', customerInfo.acrebisSupervisor || '', 'Customer Supervisor', customerInfo.customerSupervisor || ''],
      ['', '', '', ''], // Empty row for spacing
      ['Location Wise Report', '', '', ''],
      ['', '', '', ''] // Empty row for spacing
    ];
    
    // Prepare report data without Date column
    const reportData = data.map(item => ({
      'Pur_Ret_UPC': item.Pur_Ret_UPC,
      'Inventory_Item_ID': item.Inventory_Item_ID,
      'Item_Description': item.Item_Description,
      'Location': item.Location,
      'Quantity': item.Quantity
    }));
    
    // Create worksheet with customer info first
    const worksheet = XLSX.utils.aoa_to_sheet(customerData);
    
    // Add report data starting from row after customer info
    XLSX.utils.sheet_add_json(worksheet, reportData, { 
      origin: `A${customerData.length + 1}`,
      skipHeader: false 
    });
    
    // Center align the Quantity column in Excel
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let row = customerData.length + 1; row <= range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: 4 }); // Column E (Quantity)
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = { alignment: { horizontal: 'center' } };
      }
    }
    const quantityHeaderCell = XLSX.utils.encode_cell({ r: customerData.length, c: 4 }); // E header row
    if (worksheet[quantityHeaderCell]) {
      worksheet[quantityHeaderCell].s = { alignment: { horizontal: 'center' } };
    }
    
    // Set column widths for better formatting
    const colWidths = [
      { wch: 15 }, // Pur_Ret_UPC
      { wch: 20 }, // Inventory_Item_ID / Customer info labels
      { wch: 40 }, // Item_Description / Customer info values
      { wch: 15 }, // Location / Customer info labels
      { wch: 10 }  // Quantity / Customer info values
    ];
    worksheet['!cols'] = colWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Location Wise Report');
    
    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Create blob and save file
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 
    });
    
    saveAs(blob, `location-wise-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Error exporting to Excel. Please try again.');
  }
};

export const exportConsolidatedToExcel = (data: ConsolidatedReportItem[], customerInfo: CustomerInfo) => {
  try {
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Prepare customer information data
    const customerData = [
      ['Customer Information', '', '', ''],
      ['Customer Name', customerInfo.customerName || '', 'Date of Stock Take', customerInfo.dateOfStockCount || ''],
      ['Customer ID', customerInfo.customerId || '', 'Time of Stock Take', customerInfo.timeOfStockCount || ''],
      ['Outlet Address', customerInfo.outletAddress || '', '', ''],
      ['ACREBIS Supervisor', customerInfo.acrebisSupervisor || '', 'Customer Supervisor', customerInfo.customerSupervisor || ''],
      ['', '', '', ''], // Empty row for spacing
      ['Consolidated Report', '', '', ''],
      ['', '', '', ''], // Empty row for spacing
      ['Location', 'Quantity', '', ''] // Report headers
    ];
    
    // Prepare report data as array of arrays for precise control
    const reportData = data.map(item => [item.Location, item.Quantity, '', '']);
    
    // Create worksheet with customer info and headers
    const worksheet = XLSX.utils.aoa_to_sheet(customerData);
    
    // Add report data starting from row after customer info and headers
    XLSX.utils.sheet_add_aoa(worksheet, reportData, { 
      origin: `A${customerData.length + 1}`
    });
    
    // Center align the Quantity column (including header) in Excel
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    // Start from the header row (customerData.length - 1) to include the "Quantity" header
    for (let row = customerData.length - 1; row <= range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: 1 }); // Column B (Quantity)
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = { alignment: { horizontal: 'center' } };
      }
    }
    
    // Set column widths for better formatting
    const colWidths = [
      { wch: 40 }, // Location / Customer info labels
      { wch: 20 }, // Quantity / Customer info values
      { wch: 15 }, // Customer info labels
      { wch: 15 }  // Customer info values
    ];
    worksheet['!cols'] = colWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Consolidated Report');
    
    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Create blob and save file
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 
    });
    
    saveAs(blob, `consolidated-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Error exporting to Excel. Please try again.');
  }
};