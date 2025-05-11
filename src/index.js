const { getFilePaths } = require('./utils/pathUtils');
const { cleanCsvFile } = require('./utils/cleanCsvFile');
const { processFiles } = require('./processFiles');
const { isValidDateFormat } = require('./utils/validators');
const { writeCsvFromJson } = require('./utils/writeCsv');
const { deleteIntermediateFiles } = require('./utils/deleteIntermediateFiles');
const fs = require('fs');
const csv = require('csv-parser');

async function main() {
    const args = process.argv.slice(2);
    const dateArg = args[0];
    
    if (!isValidDateFormat(dateArg)) {
        console.error('Error: Invalid date format. Please use mm-dd-yy and ensure the date is valid.');
        process.exit(1);
      }
    
    const filePaths = getFilePaths(dateArg);
    const ordersFile = filePaths.ordersFile;
    const adFeesFile = filePaths.adFeesFile;
    const shippingLabelsFile = filePaths.shippingLabelsFile;

    const ordersDataFile = filePaths.ordersDataFile;
    const adFeesDataFile = filePaths.adFeesDataFile;
    const shippingLabelsDataFile = filePaths.shippingLabelsDataFile;

    await cleanCsvFile(ordersFile, ordersDataFile);
    await cleanCsvFile(adFeesFile, adFeesDataFile);
    await cleanCsvFile(shippingLabelsFile, shippingLabelsDataFile);

    const jsonData = await processFiles(ordersDataFile, adFeesDataFile, shippingLabelsDataFile);

    console.log('JSON Data:', jsonData);

    const outputFolder = filePaths.baseFolder;
    
    try {
      writeCsvFromJson(jsonData, dateArg, filePaths.baseFolder);
  
      // Only delete files if CSV writing succeeded
      await deleteIntermediateFiles(
        ordersDataFile,
        adFeesDataFile,
        shippingLabelsDataFile
      );
    } catch (err) {
      console.error('❌ Failed to write final CSV:', err.message);
      console.warn('Intermediate files were NOT deleted for debugging.');
    }
}

main();

// Example of reading one of the CSV files
// fs.createReadStream(filePaths.adFeesFile)
//   .pipe(csv())
//   .on('data', (data) => {
//     console.log(data);
//   })
//   .on('end', () => {
//     console.log('CSV file processed');
//   });
