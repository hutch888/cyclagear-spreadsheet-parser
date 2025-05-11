const fs = require('fs');
const csv = require('csv-parser');

function parseCsvFile(filePath, startColumn) {
  console.log('filePath = ', filePath);  
  const rows = [];
  return new Promise((resolve, reject) => {
    let headerSkipped = false;
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        //console.log(`row = ${JSON.stringify(row)}`);
        if (!headerSkipped) {
          if (row['Transaction creation date']) {
            headerSkipped = true; // Detect where the header row starts
          } else {
            return; // Skip lines until headers are found
          }
        }
        rows.push(row); // Store the rows after the header
      })
      .on('end', () => resolve(rows))
      .on('error', (err) => reject(err));
  });
}

module.exports = { parseCsvFile }
