// Export utilities for reports
export interface ExportOptions {
  filename: string;
  title: string;
  data: any[];
  columns: ExportColumn[];
}

export interface ExportColumn {
  key: string;
  label: string;
  width?: number;
  formatter?: (value: any, row: any) => string;
}

// CSV Export
export const exportToCSV = (options: ExportOptions) => {
  const { filename, data, columns } = options;
  
  // Create CSV header
  const headers = columns.map(col => col.label).join(',');
  
  // Create CSV rows
  const rows = data.map(row => 
    columns.map(col => {
      const value = col.formatter ? col.formatter(row[col.key], row) : row[col.key];
      // Escape commas and quotes in CSV
      return `"${String(value || '').replace(/"/g, '""')}"`;
    }).join(',')
  );
  
  // Combine header and rows
  const csvContent = [headers, ...rows].join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Excel Export (using basic CSV format for now)
export const exportToExcel = (options: ExportOptions) => {
  // For now, we'll use CSV format which can be opened in Excel
  // In a full implementation, you'd use a library like xlsx
  exportToCSV({ ...options, filename: `${options.filename}.xlsx` });
};

// PDF Export (basic implementation)
export const exportToPDF = (options: ExportOptions) => {
  const { filename, title, data, columns } = options;
  
  // Create a simple HTML table for PDF generation
  const tableHtml = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1976d2; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <table>
          <thead>
            <tr>
              ${columns.map(col => `<th>${col.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => 
              `<tr>${columns.map(col => {
                const value = col.formatter ? col.formatter(row[col.key], row) : row[col.key];
                return `<td>${String(value || '')}</td>`;
              }).join('')}</tr>`
            ).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
  
  // Create and download file
  const blob = new Blob([tableHtml], { type: 'text/html' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.html`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Print functionality
export const printReport = (options: ExportOptions) => {
  const { title, data, columns } = options;
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  const tableHtml = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1976d2; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          @media print {
            body { margin: 0; }
            table { font-size: 12px; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <table>
          <thead>
            <tr>
              ${columns.map(col => `<th>${col.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => 
              `<tr>${columns.map(col => {
                const value = col.formatter ? col.formatter(row[col.key], row) : row[col.key];
                return `<td>${String(value || '')}</td>`;
              }).join('')}</tr>`
            ).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
  
  printWindow.document.write(tableHtml);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};


