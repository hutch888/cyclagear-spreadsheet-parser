const fs = require('fs');
const csv = require('csv-parser');

/**
 * Parse a cleaned (comma‑separated) eBay Transaction report **while preserving
 * the order that the first "order" row appears in the file**.
 *
 * It returns an **array** rather than an object so the caller can write rows
 * directly in the original sequence.
 *
 * @param {string} filePath – absolute path to the cleaned CSV produced by cleanCsvFile
 * @returns {Promise<Array<Object>>} – ordered rows ready for CSV output
 */
function parseCsvFile(filePath) {
  console.log('Reading CSV from:', filePath);

  // lookup by order number (for quick mutation) + ordered array of refs
  const map = new Map();
  const rows = [];

  const csvOptions = {
    mapHeaders: ({ header }) => header.trim(),
  };

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv(csvOptions))
      .on('data', (row) => {
        // Skip header row emitted by csv-parser
        if (row['Type'] === 'Type') return;

        const type = (row['Type'] || '').toLowerCase();
        const orderNo = row['Order number'];
        if (!orderNo) return;

        // Create a row object *only* when we first encounter an "order" line
        // always create aggregate row on first sight of any line
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
          };
          map.set(orderNo, obj);
          rows.push(obj);
        }

        const order = map.get(orderNo);
        if (!order) return;     // Ignore fee/label rows w/o matching order

        if (type === 'order') {
          // SKU & title are most reliable here
          if (!order.sku && row['Custom label']) order.sku = row['Custom label'];
          if (!order.itemTitle && row['Item title']) order.itemTitle = row['Item title'];

          order.quantity    += parseInt(row['Quantity'] || '0', 10);
          order.soldAmount  = round2(order.soldAmount + parseFloat(row['Item subtotal'] || '0'));
          order.fvFee       = round2(order.fvFee + parseFloat(row['Final Value Fee - fixed'] || '0') +
                                                  parseFloat(row['Final Value Fee - variable'] || '0'));
        } else if (type === 'other fee') {
          // Treat every net amount from an "Other fee" row as Ad fee for that order
          order.adFee = round2(order.adFee + parseFloat(row['Net amount'] || '0'));
        }
        else if (type === 'shipping label') {
          order.shipCost = round2(order.shipCost + parseFloat(row['Net amount'] || '0'));
        }
      })
      .on('end', () => {
        console.log('Finished parsing. Total valid orders:', rows.length);
        resolve(rows.slice().reverse()); // return in reverse order
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
