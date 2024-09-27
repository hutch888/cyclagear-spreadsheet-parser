require('dotenv').config();
const path = require('path');

/**
 * Format a date as mm-dd-yy
 * @param argDate: a date with format mm-dd-yy
 * @returns string with the formatted date.
 */
function getFormattedDate(argDate) {
    if (argDate) {
        return argDate;
    }

    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = String(today.getFullYear()).slice(-2);
    
    return `${month}-${day}-${year}`;
}

/**
 * Generate the full folder path to the csv files
 * @param argDate: a date with format mm-dd-yy
 * @returns a string of the path
 */
function getReportsFolderPath(argDate) {
    const dateString = getFormattedDate(argDate);
    return path.join(process.env.BASE_REPORTS_PATH, dateString);
}

// Function to generate the full file paths
/**
 * Generate the full file paths
 * @param argDate: a date with format mm-dd-yy
 * @returns an object with the paths to the csv files
 */
function getFilePaths(argDate) {
    const dateString = getFormattedDate(argDate);
    const folderPath = getReportsFolderPath(argDate);

    return {
        adFeesFile: path.join(folderPath, `ad-fees-${dateString}.csv`),
        ordersFile: path.join(folderPath, `orders-${dateString}.csv`),
        shippingLabelsFile: path.join(folderPath, `shipping-labels-${dateString}.csv`),
        adFeesDataFile: path.join(folderPath, `ad-fees-data.csv`),
        ordersDataFile: path.join(folderPath, `orders-data.csv`),
        shippingLabelsDataFile: path.join(folderPath, `shipping-labels-data.csv`),
    };
}

// Example usage:
// const filePaths = getFilePaths();
// console.log('Ad Fees File:', filePaths.adFeesFile);
// console.log('Orders File:', filePaths.ordersFile);
// console.log('Shipping Labels File:', filePaths.shippingLabelsFile);

module.exports = { getFilePaths };
