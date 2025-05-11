const fs = require('fs/promises');

async function deleteIntermediateFiles(...filePaths) {
  for (const filePath of filePaths) {
    try {
      await fs.unlink(filePath);
      console.log(`Deleted: ${filePath}`);
    } catch (err) {
      console.warn(`Failed to delete ${filePath}: ${err.message}`);
    }
  }
}

module.exports = { deleteIntermediateFiles };