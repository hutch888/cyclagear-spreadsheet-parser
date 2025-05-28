const fs = require('fs');
const path = require('path');
const os = require('os');
require('dotenv').config();

/**
 * Expand a leading ~ to the current user's home directory.
 * @param {string} p
 * @returns {string}
 */
function expandHome(p) {
  return p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p;
}

/**
 * Return the absolute path of the dated report folder for a given mm-dd-yy string.
 * BASE_REPORTS_PATH must be defined in .env.
 * @param {string} dateStr
 */
function getReportFolder(dateStr) {
  const base = process.env.BASE_REPORTS_PATH;
  if (!base) throw new Error('BASE_REPORTS_PATH is not set in the environment');
  return path.join(expandHome(base), dateStr);
}

/**
 * Locate the first Transaction_report*.csv file inside the dated folder.
 * If several exist, returns the most recently modified one.
 * @param {string} dateStr - Date in mm-dd-yy format.
 * @returns {string} absolute path to CSV
 */
function getTransactionReportPath(dateStr) {
  const folder = getReportFolder(dateStr);
  if (!fs.existsSync(folder)) {
    throw new Error(`Report folder not found: ${folder}`);
  }

  const candidates = fs.readdirSync(folder)
    .filter((f) => f.startsWith('Transaction_report'))
    .filter((f) => f.endsWith('.csv'));

  if (candidates.length === 0) {
    throw new Error(`No Transaction_report*.csv file found in ${folder}`);
  }

  // If multiple, pick the newest by mtime
  const sorted = candidates.sort((a, b) => {
    const aTime = fs.statSync(path.join(folder, a)).mtimeMs;
    const bTime = fs.statSync(path.join(folder, b)).mtimeMs;
    return bTime - aTime;
  });

  return path.join(folder, sorted[0]);
}

module.exports = {
  getReportFolder,
  /**
   * Original helper for callers that expect "getFilePaths".
   * Returns the absolute path to the single Transaction_report CSV
   * inside the dated folder.
   *
   * @param {string} dateStr mm-dd-yy
   * @returns {{ transactionReportPath: string }}
   */
  getFilePaths: (dateStr) => ({ transactionReportPath: getTransactionReportPath(dateStr) }),
  getTransactionReportPath,
};
