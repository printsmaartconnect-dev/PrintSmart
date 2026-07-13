/**
 * Utility to generate the QR Code value for a given shop ID.
 * The value must target: https://print-smart-18.vercel.app/shop/{shopId}
 */
export const getShopQRValue = (shopId: string): string => {
  if (!shopId) return '';
  return `https://print-smart-18.vercel.app/?shopId=${shopId}`;
};
