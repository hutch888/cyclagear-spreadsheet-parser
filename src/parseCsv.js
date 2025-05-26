const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

/**
 * Parses a combined eBay transaction report and groups data by order number.
 * @param {string} filePath - Full path to the CSV file.
 * @returns {Promise<Object>} - A promise that resolves to an object keyed by order number.
 */
function parseCsvFile(filePath) {
  console.log('Reading CSV from:', filePath);

  const orders = {};

  return new Promise((resolve, reject) => {
    let headerSkipped = false;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Wait until real headers show up
        if (!headerSkipped) {
          if (row['Transaction creation date']) {
            headerSkipped = true;
          } else {
            return;
          }
        }

        const type = row['Type']?.toLowerCase();
        const orderNumber = row['Order number'];
        if (!orderNumber) return;

        if (!orders[orderNumber]) {
          orders[orderNumber] = {
            sku: row['Custom label'], // Q → SKU
            dateSold: formatDate(row['Transaction creation date']), // A → Date Sold
            itemTitle: row['Item title'], // P → 2025 Online Inventory Tracker
            quantity: parseInt(row['Quantity'] || '0'), // R → # Sold
            soldAmount: parseFloat(row['Item subtotal'] || '0'), // S → Sold $
            fvFee: 0, // FV Fee = W + X
            adFee: 0, // AE from "Other fee"
            shipCost: 0 // AE from "Shipping label"
          };
        }

        const order = orders[orderNumber];

        if (type === 'order') {
          order.fvFee += parseFloat(row['Final Value Fee - fixed'] || '0'); // W
          order.fvFee += parseFloat(row['Final Value Fee - variable'] || '0'); // X
        } else if (type === 'other fee') {
          const desc = row['Description']?.toLowerCase();
          if (desc?.includes('promoted listings')) {
            order.adFee += parseFloat(row['Net amount'] || '0'); // AE → Ad Fee
          }
        } else if (type === 'shipping label') {
          order.shipCost += parseFloat(row['Net amount'] || '0'); // AE → Ship Cost
        }
      })
      .on('end', () => resolve(orders))
      .on('error', reject);
  });
}

function formatDate(dateString) {
  const parsedDate = new Date(dateString);
  if (isNaN(parsedDate)) return dateString;
  const m = parsedDate.getMonth() + 1;
  const d = parsedDate.getDate();
  const y = parsedDate.getFullYear().toString().slice(-2);
  return `${m}/${d}/${y}`;
}

module.exports = { parseCsvFile };

