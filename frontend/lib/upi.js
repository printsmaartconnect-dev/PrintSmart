/**
 * Validates UPI payment parameters.
 * @param {string} upiId - The merchant's UPI ID (e.g., shopname@bank)
 * @param {string} shopName - The name of the shop
 * @param {number|string} amount - The amount to be paid
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateUpiParams(upiId, shopName, amount) {
  if (!upiId || typeof upiId !== 'string' || upiId.trim() === '') {
    return { valid: false, error: 'Missing shopkeeper UPI ID' };
  }
  
  if (!shopName || typeof shopName !== 'string' || shopName.trim() === '') {
    return { valid: false, error: 'Missing shop name' };
  }
  
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return { valid: false, error: 'Invalid payment amount' };
  }
  
  return { valid: true };
}

/**
 * Generates a UPI Intent URL.
 * @param {string} upiId - The merchant's UPI ID
 * @param {string} shopName - The name of the shop
 * @param {number|string} amount - The amount to be paid
 * @returns {string} The UPI Intent URL
 * @throws {Error} If validation fails
 */
export function generateUpiUrl(upiId, shopName, amount) {
  const validation = validateUpiParams(upiId, shopName, amount);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const formattedAmount = parseFloat(amount).toFixed(2);
  
  // Requirement 2: const upiUrl = `upi://pay?pa=${upiId}&pn=${shopName}&am=${amount}&cu=INR`;
  // We use encodeURIComponent for shopName to handle spaces/special characters in URLs.
  return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}&am=${formattedAmount}&cu=INR`;
}
