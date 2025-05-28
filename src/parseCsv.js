const fs = require('fs');
const csv = require('csv-parser');

/**
 * Parse a cleaned (comma‑separated) eBay Transaction report and aggregate by order number.
 * Only keep orders that have at least one "order" row (quantity > 0).
 *
 * @param {string} filePath absolute path to cleaned CSV produced by cleanCsvFile.
 * @returns {Promise<Object>} keyed by order number.
 */
function parseCsvFile(filePath) {
  console.log('Reading CSV from:', filePath);

  const orders = {};
  const csvOptions = {
    mapHeaders: ({ header }) => header.trim(),
  };

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv(csvOptions))
      .on('data', (row) => {
        // Skip header row (csv-parser still emits it)
        if (row['Type'] === 'Type') return;

        const type = row['Type']?.toLowerCase();
        const orderNumber = row['Order number'];
        if (!orderNumber) return;

        if (!orders[orderNumber]) {
          orders[orderNumber] = {
            sku: '',
            dateSold: formatDate(row['Transaction creation date']),
            itemTitle: '',
            quantity: 0,
            soldAmount: 0,
            fvFee: 0,
            adFee: 0,
            shipCost: 0,
          };
        }

        const order = orders[orderNumber];

        if (type === 'order') {
          // Capture SKU/title from the order row (most reliable)
          if (row['Custom label']) order.sku = row['Custom label'];
          if (row['Item title']) order.itemTitle = row['Item title'];

          order.quantity += parseInt(row['Quantity'] || '0', 10);
          order.soldAmount = round2(order.soldAmount + parseFloat(row['Item subtotal'] || '0'));
          order.fvFee = round2(order.fvFee + parseFloat(row['Final Value Fee - fixed'] || '0') + parseFloat(row['Final Value Fee - variable'] || '0'));
        } else if (type === 'other fee') {
          const desc = row['Description']?.toLowerCase();
          if (desc?.includes('promoted listings')) {
            order.adFee = round2(order.adFee + parseFloat(row['Net amount'] || '0'));
          }
        } else if (type === 'shipping label') {
          order.shipCost = round2(order.shipCost + parseFloat(row['Net amount'] || '0'));
        }
      })
      .on('end', () => {
        // Remove entries that never had a real order row (quantity === 0)
        for (const [key, val] of Object.entries(orders)) {
          if (val.quantity === 0) delete orders[key];
          // Default zeros rounded
          val.fvFee = round2(val.fvFee);
        }
        console.log('Finished parsing. Total valid orders:', Object.keys(orders).length);
        resolve(orders);
      })
      .on('error', reject);
  });
}

function formatDate(dateString) {
  const parsed = new Date(dateString);
  if (isNaN(parsed)) return dateString;
  const m = parsed.getMonth() + 1;
  const d = parsed.getDate();
  const y = parsed.getFullYear().toString().slice(-2);
  return `${m}/${d}/${y}`;
}

function round2(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

module.exports = { parseCsvFile };
