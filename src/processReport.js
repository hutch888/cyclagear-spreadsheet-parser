const fs = require('fs');
const path = require('path');
const { parseCsvFile } = require('./parseCsv');

/**
 * Processes a given folder of reports, finds the Transaction_report CSV,
 * and generates a summary output CSV in the same folder.
 *
 * @param {string} dateStr - Date string in mm-dd-yy format.
 */
async function processReport(dateStr) {
  const basePath = process.env.BASE_REPORTS_PATH;
  const folderPath = path.join(basePath, dateStr);

  const reportFile = fs.readdirSync(folderPath)
    .find(file => file.startsWith('Transaction_report'));

  if (!reportFile) {
    console.error('No Transaction_report file found in folder:', folderPath);
    return;
  }

  const fullPath = path.join(folderPath, reportFile);
  const orders = await parseCsvFile(fullPath);

  const outputPath = path.join(folderPath, `newRows-${dateStr}.csv`);
  const output = fs.createWriteStream(outputPath);

  output.write('SKU,Date sold,2026 Online Inventory Tracker,# Sold,Sold $,FV Fee,Ad Fee,Ship Cost, Paid ship\n');

  for (const order of Object.values(orders)) {
    output.write([
      order.sku,
      order.dateSold,
      order.itemTitle,
      order.quantity,
      order.soldAmount.toFixed(2),
      order.fvFee.toFixed(2),
      order.adFee.toFixed(2),
      order.shipCost.toFixed(2),
      order.paidShip.toFixed(2)
    ].join(',') + '\n');
  }

  output.end();
  console.log(`Report written to ${outputPath}`);
}

const [,, dateArg] = process.argv;
if (!dateArg) {
  console.error('Usage: npm run generate-report -- <mm-dd-yy>');
  process.exit(1);
}

processReports(dateArg);