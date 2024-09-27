const { parseCsvFile } = require('./parseCsv');

async function processFiles(ordersFile, adFeesFile, shippingLabelsFile) {
    try {
      const orders = await parseCsvFile(ordersFile);
      const adFees = await parseCsvFile(adFeesFile);
      const shippingLabels = await parseCsvFile(shippingLabelsFile);
      // Map of Orders by Order number
      const ordersMap = new Map();
      orders.forEach((row) => {
        const orderNumber = row['Order number'];
        ordersMap.set(orderNumber, {
          'Order number': orderNumber,
          'Date sold': row['Transaction creation date'],
          '2024 Online Inventory Tracker': row['Item title'],
          '# Sold': row['Quantity'],
          'Sold $': row['Item subtotal'],
          'Final Value Fee - fixed': row['Final Value Fee - fixed'],
          'Final Value Fee - variable': row['Final Value Fee - variable'],
          'Ad Fee': 0, // Default to 0, will be updated later
          'Ship Cost': 0, // Default to 0, will be updated later
          'FV Fee': 0,  // Will be calculated later
        });
      });
  
      // Map Ad Fees data to orders
      adFees.forEach((row) => {
        const orderNumber = row['Order number'];
        if (ordersMap.has(orderNumber)) {
          ordersMap.get(orderNumber)['Ad Fee'] = row['Gross transaction amount'];
        } else {
          console.log(`ad-fees does not contain order ${orderNumber}`);
        }
      });
  
      // Map Shipping Labels data to orders
      shippingLabels.forEach((row) => {
        const orderNumber = row['Order number'];
        if (ordersMap.has(orderNumber)) {
          ordersMap.get(orderNumber)['Ship Cost'] = row['Net amount'];
        } else {
          console.log(`shipping-labels contains order ${orderNumber}, which is not found in orders`);
        }
      });
  
      // Calculate FV Fee for each order
      ordersMap.forEach((order) => {
        order['FV Fee'] =
          parseFloat(order['Final Value Fee - fixed']) - parseFloat(order['Final Value Fee - variable']);
      });
  
      // Check for missing orders in Ad Fees and Shipping Labels
      orders.forEach((row) => {
        const orderNumber = row['Order number'];
        if (!adFees.some((adFeeRow) => adFeeRow['Order number'] === orderNumber)) {
          console.log(`ad-fees does not contain order ${orderNumber}`);
        }
        if (!shippingLabels.some((shipRow) => shipRow['Order number'] === orderNumber)) {
          console.log(`shipping-labels does not contain order ${orderNumber}`);
        }
      });
  
      // Convert the Map to an array of objects and return the final JSON data
      const result = Array.from(ordersMap.values());
      return result;
    } catch (err) {
      console.error('Error processing files:', err);
    }
  }

module.exports = { processFiles };
  