const { getFilePaths } = require('./utils/pathUtils');
const { cleanCsvFile } = require('./utils/cleanCsvFile');
const { processFiles } = require('./processFiles');
const { isValidDateFormat } = require('./utils/validators');
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
