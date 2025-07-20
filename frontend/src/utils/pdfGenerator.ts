import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ReportsData } from '@/services/reportsApi';

export const generateClientPDF = async (reportData: ReportsData, timeRange: string, userName: string, userEmail: string) => {
  try {
    // Create a temporary container for the report
    const reportContainer = document.createElement('div');
    reportContainer.style.position = 'absolute';
    reportContainer.style.left = '-9999px';
    reportContainer.style.top = '0';
    reportContainer.style.width = '210mm'; // A4 width
    reportContainer.style.padding = '20mm';
    reportContainer.style.fontFamily = 'Arial, sans-serif';
    reportContainer.style.backgroundColor = 'white';
    
    // Create the report HTML content
    reportContainer.innerHTML = `
      <style>
        .report-container {
          font-family: Arial, sans-serif;
          line-height: 1.4;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #dc2626;
          padding-bottom: 20px;
        }
        .company-title {
          font-size: 24px;
          font-weight: bold;
          color: #dc2626;
          margin: 0;
        }
        .report-subtitle {
          font-size: 16px;
          margin: 10px 0 0 0;
          color: #666;
        }
        .section-title {
          background: #dc2626;
          color: white;
          padding: 10px 15px;
          margin: 20px 0 10px 0;
          font-size: 16px;
          font-weight: bold;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        .data-table th,
        .data-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 12px;
        }
        .data-table th {
          background: #f5f5f5;
          font-weight: bold;
        }
        .data-table tr:nth-child(even) {
          background: #f9f9f9;
        }
        .metric-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .metric-label {
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
          font-size: 12px;
        }
      </style>
      
      <div class="report-container">
        <!-- Header -->
        <div class="header">
          <h1 class="company-title">🌾 FarmConnect</h1>
          <p class="report-subtitle">Sales & Purchase Report</p>
          <p>Generated for: ${userName} | ${new Date().toLocaleDateString()}</p>
        </div>

        <!-- Summary -->
        <div class="section-title">📊 Summary</div>
        <div class="metric-row">
          <span class="metric-label">Total Sales:</span>
          <span>${reportData.summary.totalSales} units</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Total Revenue:</span>
          <span>₱${reportData.summary.totalRevenue.toLocaleString()}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Total Purchases:</span>
          <span>${reportData.summary.totalPurchases} units</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Total Expenses:</span>
          <span>₱${reportData.summary.totalExpenses.toLocaleString()}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Net Profit:</span>
          <span>₱${reportData.summary.profit.toLocaleString()}</span>
        </div>

        ${reportData.topProducts.length > 0 ? `
        <!-- Top Products -->
        <div class="section-title">🏆 Top Products</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Units Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.topProducts.slice(0, 5).map(product => `
              <tr>
                <td>${product.name}</td>
                <td>${product.sales}</td>
                <td>₱${product.revenue.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : ''}

        ${reportData.categories.length > 0 ? `
        <!-- Categories -->
        <div class="section-title">📈 Categories</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Revenue</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.categories.map(category => `
              <tr>
                <td>${category.name}</td>
                <td>₱${category.revenue.toLocaleString()}</td>
                <td>${category.percentage.toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : ''}

        ${reportData.recentSales.length > 0 ? `
        <!-- Recent Sales -->
        <div class="section-title">💼 Recent Sales</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Customer</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.recentSales.slice(0, 5).map(sale => `
              <tr>
                <td>${sale.date}</td>
                <td>${sale.product}</td>
                <td>${sale.customer}</td>
                <td>₱${sale.amount.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          <p>FarmConnect Agricultural Report</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;
    
    // Append to body temporarily
    document.body.appendChild(reportContainer);
    
    // Convert to canvas
    const canvas = await html2canvas(reportContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    
    // Remove from body
    document.body.removeChild(reportContainer);
    
    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Generate filename
    const date = new Date().toISOString().split('T')[0];
    const filename = `farmconnect-report-${timeRange}-${date}.pdf`;
    
    // Save the PDF
    pdf.save(filename);
    
  } catch (error) {
    console.error('Error generating client-side PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};
