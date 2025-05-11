// src/utils/validators.js

function isValidDateFormat(dateStr) {
    // Check if dateStr matches the mm-dd-yy format
    const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-\d{2}$/;
    if (!regex.test(dateStr)) {
      return false;
    }

    const [month, day, year] = dateStr.split('-').map(Number);
    const fullYear = 2000 + year;
  
    // Check if it's a valid date
    const date = new Date(fullYear, month - 1, day); // JS months are 0-indexed
    return date.getMonth() === month - 1 && date.getDate() === day && date.getFullYear() === fullYear;
  }
  
  module.exports = { isValidDateFormat };
  