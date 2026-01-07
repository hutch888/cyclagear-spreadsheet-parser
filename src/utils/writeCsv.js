const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

/**
 * Write the aggregated rows array into a CSV whose header matches your template.
 * @param {Array<Object>} rows   Array produced from parseCsvFile (already rounded)
 * @param {string} dateArg       mm-dd-yy string used in the output filename
 * @param {string} outputFolder  Folder in which to write the newRows-<date>.csv
 */
function writeCsvFromJson(rows, dateArg, outputFolder) {
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn('⚠️  No rows to write — output CSV will only contain header.');
  }

  // Map internal property names → desired header labels
  const fields = [
    { label: 'SKU', value: 'sku' },
    { label: 'Date sold', value: 'dateSold' },
    { label: '2025 Online Inventory Tracker', value: 'itemTitle' },
    { label: '# Sold', value: 'quantity' },
    { label: 'Sold $', value: 'soldAmount' },
    { label: 'FV Fee', value: 'fvFee' },
    { label: 'Ad Fee', value: 'adFee' },
    { label: 'Ship Cost', value: 'shipCost' },
    { label: 'Paid Ship', value: 'paidShip' },
  ];

  const parser = new Parser({ fields, header: true, quote: '' });
  const csv = parser.parse(rows);

  const outputFilename = `newRows-${dateArg}.csv`;
  const outputPath = path.join(outputFolder, outputFilename);

  fs.writeFileSync(outputPath, csv, 'utf8');
  console.log(`CSV file written to ${outputPath}`);
}

module.exports = { writeCsvFromJson };