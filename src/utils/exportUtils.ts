import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { LocationWiseReportItem, ConsolidatedReportItem, CustomerInfo } from '../types';

const getFormattedTimestamp = () => {
  const now = new Date();
  return now.toLocaleString();
};

const renderCustomerInfoTable = (doc, customerInfo, startY = 30) => {
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

export const exportLocationWiseToPDF = (data, customerInfo, companyLogo) => {
  const doc = new jsPDF();
  const finalData = [];
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
        item.Quantity
      ]);
    });

    const subtotal = locationRows.reduce((sum, item) => sum + item.Quantity, 0);
    finalData.push([{
      content: `Subtotal for ${location}: ${subtotal}`,
      colSpan: 5,
      styles: { fontStyle: 'bold', fillColor: [220, 220, 220] }
    }]);
  });

  const grandTotal = data.reduce((sum, d) => sum + d.Quantity, 0);
  finalData.push([{
    content: `Grand Total: ${grandTotal}`,
    colSpan: 5,
    styles: { fontStyle: 'bold', fillColor: [180, 255, 180] }
  }]);

  doc.setFontSize(18);
  doc.text('LOCATION WISE REPORT', doc.internal.pageSize.width / 2, 22, { align: 'center' });

  doc.autoTable({
    startY: 58,
    head: [['Pur_Ret_UPC', 'Inventory_Item_ID', 'Item_Description', 'Location', 'Quantity']],
    body: finalData,
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    styles: { fontSize: 8 },
    margin: { top: 58 },
    didDrawPage: function (data) {
      if (companyLogo) {
        doc.addImage(companyLogo, 'JPEG', 15, 10, 15, 15);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 0, 0);
      doc.text('acrebis', doc.internal.pageSize.width - 25, 20);

      renderCustomerInfoTable(doc, customerInfo, 28);

      const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
      const pageCount = doc.internal.getNumberOfPages();
      const ts = getFormattedTimestamp();
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Generated: ${ts} | Page ${pageNumber} of ${pageCount}`, 15, doc.internal.pageSize.height - 10);
    }
  });

  doc.save('location-wise-report.pdf');
};

export const exportConsolidatedToPDF = (data, customerInfo, companyLogo) => {
  const doc = new jsPDF();

  const grandTotal = data.reduce((sum, d) => sum + d.Quantity, 0);
  const tableData = data.map(d => [d.Location, d.Quantity]);
  tableData.push([
    { content: `Grand Total: ${grandTotal}`, colSpan: 2, styles: { fontStyle: 'bold', fillColor: [180, 255, 180] } }
  ]);

  doc.setFontSize(18);
  doc.text('CONSOLIDATED REPORT', doc.internal.pageSize.width / 2, 22, { align: 'center' });

  doc.autoTable({
    startY: 58,
    head: [['Location', 'Quantity']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    styles: { fontSize: 8 },
    margin: { top: 58 },
    didDrawPage: function (data) {
      if (companyLogo) {
        doc.addImage(companyLogo, 'JPEG', 15, 10, 15, 15);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 0, 0);
      doc.text('acrebis', doc.internal.pageSize.width - 25, 20);

      renderCustomerInfoTable(doc, customerInfo, 28);

      const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
      const pageCount = doc.internal.getNumberOfPages();
      const ts = getFormattedTimestamp();
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Generated: ${ts} | Page ${pageNumber} of ${pageCount}`, 15, doc.internal.pageSize.height - 10);
    }
  });

  doc.save('consolidated-report.pdf');
};

export const exportLocationWiseToExcel = (data) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet_to_workbook(workbook, worksheet, 'Location Wise Report');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, 'location-wise-report.xlsx');
};

export const exportConsolidatedToExcel = (data) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet_to_workbook(workbook, worksheet, 'Consolidated Report');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, 'consolidated-report.xlsx');
};
