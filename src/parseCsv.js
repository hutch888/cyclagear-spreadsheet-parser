const fs = require('fs');
const csv = require('csv-parser');

/**
 * Parse a cleaned (comma-separated) eBay Transaction report
 * while preserving the original row order.
 *
 * @param {string} filePath – Absolute path to the cleaned CSV
 * @returns {Promise<Array<Object>>} – Ordered rows for CSV output
 */
function parseCsvFile(filePath) {
  console.log('Reading CSV from:', filePath);

  const map = new Map();
  const rows = [];

  const csvOptions = {
    mapHeaders: ({ header }) => header.trim(),
  };

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv(csvOptions))
      .on('data', (row) => {
        if (row['Type'] === 'Type') return; // skip header rows
        const type = (row['Type'] || '').toLowerCase();
        const orderNo = row['Order number'];
        if (!orderNo) return;

        // First encounter of this order
        if (!map.has(orderNo)) {
          const obj = {
            sku: '',
            dateSold: formatDate(row['Transaction creation date']),
            itemTitle: '',
            quantity: 0,
            soldAmount: 0,
            fvFee: 0,
            adFee: 0,
            shipCost: 0,
            paidShip: 0
          };
          map.set(orderNo, obj);
          rows.push(obj);
        }

        const order = map.get(orderNo);
        if (!order) return;

        if (type === 'order') {
          if (!order.sku && row['Custom label']) order.sku = row['Custom label'];
          if (!order.itemTitle && row['Item title']) order.itemTitle = row['Item title'];

          order.quantity += parseInt(row['Quantity'] || '0', 10);
          order.soldAmount = round2(order.soldAmount + parseAmount(row['Item subtotal']));
          order.fvFee = round2(order.fvFee
            + parseAmount(row['Final Value Fee - fixed'])
            + parseAmount(row['Final Value Fee - variable'])
            + parseAmount(row['Very high "item not as described" fee'])
          );
          order.paidShip = round2(order.paidShip + parseAmount(row['Shipping and handling']));
        } else if (type === 'other fee') {
          order.adFee = round2(order.adFee + parseAmount(row['Net amount']));
        } else if (type === 'shipping label') {
          order.shipCost = round2(order.shipCost + parseAmount(row['Net amount']));
        }
      })
      .on('end', () => {
        console.log('Finished parsing. Total valid orders:', rows.length);
        resolve(rows.slice().reverse()); // reverse for output order
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

function parseAmount(value) {
  if (!value || value.trim() === '--') return 0;
  const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

module.exports = { parseCsvFile };