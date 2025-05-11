const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

function writeCsvFromJson(data, dateArg, outputFolder) {
  const fields = [
    { label: 'SKU', value: 'SKU' },
    { label: 'Date sold', value: 'Date sold' },
    { label: '2025 Online Inventory Tracker', value: '2025 Online Inventory Tracker' },
    { label: '# Sold', value: '# Sold' },
    { label: 'Sold $', value: 'Sold $' },
    { label: 'FV Fee', value: 'FV Fee' },
    { label: 'Ad Fee', value: 'Ad Fee' },
    { label: 'Ship Cost', value: 'Ship Cost' },
  ];

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(data);

  const outputFilename = `newRows-${dateArg}.csv`;
  const outputPath = path.join(outputFolder, outputFilename);

  fs.writeFileSync(outputPath, csv, 'utf8');
  console.log(`CSV file written to ${outputPath}`);
}

module.exports = { writeCsvFromJson };
