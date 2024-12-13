<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Inventory Reports</h1>

    <!-- Report Type and Date Selection -->
    <div class="mb-6 flex flex-wrap items-center gap-4">
      <div class="flex items-center">
        <label for="reportType" class="mr-2 text-gray-700">Report Type:</label>
        <select
          id="reportType"
          v-model="reportType"
          @change="fetchReport"
          class="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div v-if="reportType === 'monthly'" class="flex items-center">
        <label for="monthYear" class="mr-2 text-gray-700">Select Month:</label>
        <input
          id="monthYear"
          v-model="selectedMonth"
          type="month"
          @change="fetchReport"
          class="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div v-else class="flex items-center">
        <label for="year" class="mr-2 text-gray-700">Select Year:</label>
        <select
          id="year"
          v-model="selectedYear"
          @change="fetchReport"
          class="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="year in availableYears" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading report data...</p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
      <p class="font-bold">Error</p>
      <p>{{ error }}</p>
    </div>

    <!-- Report Content -->
    <div v-if="!isLoading && !error" class="print:block">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">
        Inventory Report for {{ reportTitle }}
      </h2>

      <!-- Inventory Items Table -->
      <div class="mb-8">
        <h3 class="text-xl font-semibold text-gray-700 mb-3">Inventory Items</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-300">
            <thead>
              <tr class="bg-gray-100">
                <th class="py-2 px-4 border-b text-left">Item Name</th>
                <th class="py-2 px-4 border-b text-left">Batch Name</th>
                <th class="py-2 px-4 border-b text-right">Batch Quantity</th>
                <th class="py-2 px-4 border-b text-right">Total Disbursed</th>
                <th class="py-2 px-4 border-b text-right">Total Remaining</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in reportData" :key="index" class="hover:bg-gray-50">
                <td class="py-2 px-4 border-b">{{ item.itemName }}</td>
                <td class="py-2 px-4 border-b">{{ item.batchName }}</td>
                <td class="py-2 px-4 border-b text-right">{{ item.batchQuantity }}</td>
                <td class="py-2 px-4 border-b text-right">{{ item.totalDisbursed }}</td>
                <td class="py-2 px-4 border-b text-right">{{ item.totalRemaining }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Narrative Report -->
      <div class="mb-8 bg-gray-100 p-6 rounded-lg">
        <h3 class="text-xl font-semibold text-gray-700 mb-3">Executive Summary</h3>
        <div class="text-gray-700 prose" v-html="narrativeReport"></div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-6 flex justify-center space-x-4 print:hidden">
        <button
          @click="downloadPDF"
          class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          :disabled="isGeneratingPDF"
        >
          {{ isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Report' }}
        </button>
        <button
          @click="printReport"
          class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Print Report
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const API_URL = 'http://localhost:5000';

const reportType = ref('monthly');
const selectedMonth = ref(new Date().toISOString().slice(0, 7));
const selectedYear = ref(new Date().getFullYear());
const availableYears = ref(Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i));

const reportData = ref([]);
const narrativeReport = ref('');
const isLoading = ref(false);
const error = ref(null);
const isGeneratingPDF = ref(false);

const reportTitle = computed(() => {
  if (reportType.value === 'monthly') {
    return new Date(selectedMonth.value).toLocaleString('default', { month: 'long', year: 'numeric' });
  } else {
    return selectedYear.value.toString();
  }
});

const fetchReport = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const params = {
      type: reportType.value,
      year: reportType.value === 'yearly' ? selectedYear.value : selectedMonth.value.split('-')[0],
      month: reportType.value === 'monthly' ? selectedMonth.value.split('-')[1] : undefined,
    };

    const response = await axios.get(`${API_URL}/api/inventory/report`, { params });
    reportData.value = response.data.data;
    narrativeReport.value = generateNarrativeReport(reportData.value);
  } catch (err) {
    console.error('Error fetching report:', err);
    error.value = 'Failed to fetch report data. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const generateNarrativeReport = (data) => {
  const totalItems = data.length;
  const totalQuantity = data.reduce((sum, item) => sum + item.batchQuantity, 0);
  const totalDisbursed = data.reduce((sum, item) => sum + item.totalDisbursed, 0);
  const totalRemaining = data.reduce((sum, item) => sum + item.totalRemaining, 0);

  const lowStockItems = data.filter(item => item.totalRemaining < item.batchQuantity * 0.2);
  const expiredItems = data.filter(item => item.totalRemaining === 0);

  let report = `
    <p>This comprehensive inventory report provides a detailed analysis of our stock levels, disbursements, and overall inventory health for the period of ${reportTitle.value}. The report aims to offer insights into our current inventory status, highlight potential areas of concern, and provide actionable recommendations for inventory management.</p>

    <h4 class="font-semibold mt-4 mb-2">Inventory Overview</h4>
    <p>Our inventory currently comprises ${totalItems} distinct items, with a total initial quantity of ${totalQuantity} units. Throughout this reporting period, we have disbursed ${totalDisbursed} units, leaving a current stock level of ${totalRemaining} units. This represents a utilization rate of ${((totalDisbursed / totalQuantity) * 100).toFixed(2)}% of our initial inventory.</p>

    <h4 class="font-semibold mt-4 mb-2">Stock Level Analysis</h4>
    <p>Upon careful examination of our current stock levels, we have identified the following key points of interest:</p>
  `;

  if (lowStockItems.length > 0) {
    const percentLowStock = ((lowStockItems.length / totalItems) * 100).toFixed(2);
    report += `
      <p>Low Stock Alert: ${lowStockItems.length} item(s), representing ${percentLowStock}% of our inventory, are currently running low on stock (less than 20% remaining). These items require immediate attention and potential restocking:</p>
      <ul class="list-disc list-inside mb-2">
        ${lowStockItems.map(item => `<li>${item.itemName} (Remaining: ${item.totalRemaining} units)</li>`).join('')}
      </ul>
      <p>It is recommended to initiate the reordering process for these items to prevent potential stockouts and ensure uninterrupted operations.</p>
    `;
  } else {
    report += `
      <p>Stock Levels: All items in our inventory are currently maintaining adequate stock levels, with no items falling below the 20% threshold. This indicates effective inventory management and timely restocking practices.</p>
    `;
  }

  if (expiredItems.length > 0) {
    const percentExpired = ((expiredItems.length / totalItems) * 100).toFixed(2);
    report += `
      <h4 class="font-semibold mt-4 mb-2">Expired or Depleted Items</h4>
      <p>${expiredItems.length} item(s), accounting for ${percentExpired}% of our inventory, have been fully depleted or have expired:</p>
      <ul class="list-disc list-inside mb-2">
        ${expiredItems.map(item => `<li>${item.itemName}</li>`).join('')}
      </ul>
      <p>It is crucial to review these items promptly. For expired items, proper disposal procedures should be followed, and for depleted items, assess the demand and consider replenishing if necessary.</p>
    `;
  }

  report += `
    <h4 class="font-semibold mt-4 mb-2">Recommendations</h4>
    <ol class="list-decimal list-inside">
      <li>Implement a more proactive approach to inventory management, particularly for items identified as low in stock.</li>
      <li>Conduct a thorough review of the demand patterns for depleted items to optimize future stock levels.</li>
      <li>Consider setting up automated alerts for items approaching low stock thresholds to facilitate timely reordering.</li>
      <li>Regularly assess and adjust minimum stock levels based on current demand and lead times.</li>
    </ol>

    <p class="mt-4">By addressing these points, we can enhance our inventory management efficiency, reduce the risk of stockouts, and optimize our working capital allocation.</p>
  `;

  return report;
};

const downloadPDF = async () => {
  isGeneratingPDF.value = true;

  try {
    const doc = new jsPDF({
      format: 'legal', // Set page size to legal
      orientation: 'portrait', // Default orientation
      unit: 'mm', // Measurement unit
    });

    const marginLeft = 14;
    const contentWidth = 196; // Adjusted for legal page
    const pageHeight = doc.internal.pageSize.height;
    let currentY = 20; // Start position for content

    // Add title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`Inventory Report for ${reportTitle.value}`, marginLeft, currentY);
    currentY += 8;

    // Add subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Generated by the system', marginLeft, currentY);
    currentY += 6;

    // Add a horizontal line below the title
    doc.setDrawColor(200);
    doc.line(marginLeft, currentY, contentWidth, currentY);
    currentY += 8;

    // Add inventory items table
    doc.autoTable({
      startY: currentY,
      head: [['Item Name', 'Batch Name', 'Batch Quantity', 'Total Disbursed', 'Total Remaining']],
      body: reportData.value.map(item => [
        item.itemName,
        item.batchName,
        item.batchQuantity,
        item.totalDisbursed,
        item.totalRemaining,
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: [255, 255, 255],
        fontSize: 12,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [240, 248, 255],
      },
      margin: { left: marginLeft, right: marginLeft },
      didDrawPage: (data) => {
        // Footer
        const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150);
        doc.text(`Page ${pageNumber}`, contentWidth, pageHeight - 10, null, null, 'right');
      },
    });
    currentY = doc.lastAutoTable.finalY + 10;

    // Add executive summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', marginLeft, currentY);
    currentY += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);

    // Add narrative report content with automatic page breaking
    const narrativeLines = doc.splitTextToSize(
      narrativeReport.value.replace(/<[^>]+>/g, ''), 
      contentWidth - 2 * marginLeft
    );

    narrativeLines.forEach((line) => {
      if (currentY + 10 > pageHeight - 20) {
        doc.addPage();
        currentY = 20; // Reset for the new page
      }
      doc.text(line, marginLeft, currentY);
      currentY += 6; // Line height
    });

    // Save the PDF
    doc.save(`Inventory_Report_${reportTitle.value.replace(' ', '_')}.pdf`);
  } catch (err) {
    console.error('Error generating PDF:', err);
    error.value = 'Failed to generate PDF. Please try again.';
  } finally {
    isGeneratingPDF.value = false;
  }
};



const printReport = () => {
  window.print();
};

onMounted(fetchReport);
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  .container, .container * {
    visibility: visible;
  }
  .container {
    position: absolute;
    left: 0;
    top: 0;
  }
  .print:hidden {
    display: none !important;
  }
}
</style>