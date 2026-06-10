/**
 * Format currency to standard format on frontend
 * Example: formatCurrency(11.18) -> ₹ 11.18
 * 
 * @param {number|string} amount - The numeric value to format
 * @returns {string} The formatted currency string
 */
export function formatCurrency(amount) {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount || 0);
  const fixedAmount = (isNaN(numericAmount) ? 0 : numericAmount).toFixed(2);
  return `₹ ${fixedAmount}`;
}
