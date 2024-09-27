const fs = require('fs');
const readline = require('readline');

// Function to clean the file by extracting rows starting from the correct header
function cleanCsvFile(inputFilePath, outputFilePath, headerKey = 'Transaction creation date') {
    return new Promise((resolve, reject) => {
      const inputStream = fs.createReadStream(inputFilePath);
      const outputStream = fs.createWriteStream(outputFilePath);
      const rl = readline.createInterface({
        input: inputStream,
        output: outputStream,
        terminal: false,
      });
  
      let headerFound = false;
  
      rl.on('line', (line) => {
        if (headerFound) {
          outputStream.write(line + '\n');
        } else if (line.includes(headerKey)) {
          // Write the header line and start capturing data
          outputStream.write(line + '\n');
          headerFound = true;
        }
      });
  
      rl.on('close', () => {
        console.log(`Cleaned CSV file created at: ${outputFilePath}`);
        resolve(); // Resolve the Promise when the cleaning is done
      });
  
      rl.on('error', (err) => {
        reject(err); // Reject the Promise on error
      });
    });
  }
  

module.exports = { cleanCsvFile };
