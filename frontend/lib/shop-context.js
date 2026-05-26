/**
 * Helper utilities to manage the customer's active shop context.
 * Resolves to the correct shopkeeper ID/slug and persists across customer flow pages.
 */

/**
 * Retrieve the current active shop ID (UUID) from localStorage.
 * @returns {string|null} Active Shopkeeper ID
 */
export function getCurrentShopId() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('activeShopId');
  }
  return null;
}

/**
 * Retrieve the current active shop slug from localStorage.
 * @returns {string|null} Active Shopkeeper Slug
 */
export function getCurrentShopSlug() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('activeShopSlug');
  }
  return null;
}

/**
 * Set the active shop details in localStorage.
 * @param {object} shop - The shopkeeper details object
 */
export function setCurrentShop(shop) {
  if (typeof window !== 'undefined' && shop) {
    localStorage.setItem('activeShopId', shop.id || '');
    localStorage.setItem('activeShopSlug', shop.shopSlug || shop.shopkeeperIdCode || '');
  }
}

/**
 * Clear the current active shop context from localStorage.
 */
export function clearCurrentShop() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('activeShopId');
    localStorage.removeItem('activeShopSlug');
  }
}
