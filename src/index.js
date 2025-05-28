require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { getTransactionReportPath, getReportFolder } = require('./utils/pathUtils');
const { cleanCsvFile } = require('./utils/cleanCsvFile');
const { parseCsvFile } = require('./parseCsv');
const { writeCsvFromJson } = require('./utils/writeCsv');
const { isValidDateFormat } = require('./utils/validators');

async function main() {
  const args = process.argv.slice(2);
  const dateArg = args[0];

  if (!isValidDateFormat(dateArg)) {
    console.error('Error: Invalid date format. Please use mm-dd-yy and ensure the date is valid.');
    process.exit(1);
  }

  try {
    // 1️⃣ Locate raw report
    const rawCsvPath = getTransactionReportPath(dateArg);
    const folder = getReportFolder(dateArg);
    const cleanedPath = path.join(folder, `cleaned-${dateArg}.csv`);

    // 2️⃣ Strip pre‑header junk once
    await cleanCsvFile(rawCsvPath, cleanedPath);

    // 3️⃣ Parse cleaned file
    const ordersObj = await parseCsvFile(cleanedPath);
    const rows = Object.values(ordersObj);

    console.log(`rows = ${JSON.stringify(rows)}`);

    // 4️⃣ Write summary CSV
    writeCsvFromJson(rows, dateArg, folder);

    // 5️⃣ Optionally delete cleaned file
    fs.unlinkSync(cleanedPath);

    console.log('✅ Report generated successfully!');
  } catch (err) {
    console.error('❌ Failed to generate report:', err.message);
    process.exit(1);
  }
}

main();