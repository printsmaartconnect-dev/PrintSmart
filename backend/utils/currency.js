/**
 * Format currency to standard format
 * Preferred: ₹ 11.18
 * Fallback (if unicode not supported): INR 11.18
 * 
 * @param {number|string} amount - The numeric value to format
 * @param {boolean} useUnicode - Whether to use the ₹ symbol or INR code
 * @returns {string} The formatted currency string
 */
function formatCurrency(amount, useUnicode = true) {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount || 0);
  const fixedAmount = (isNaN(numericAmount) ? 0 : numericAmount).toFixed(2);
  
  if (useUnicode) {
    return `₹ ${fixedAmount}`;
  }
  return `INR ${fixedAmount}`;
}

module.exports = {
  formatCurrency
};
