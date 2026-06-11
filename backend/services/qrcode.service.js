const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const localUploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');

/**
 * Generate a unique QR code for a shopkeeper
 * @param {string} shopkeeperId - Shopkeeper ID
 * @param {string} shopSlug - Shop slug (unique identifier)
 * @param {string} [customFrontendUrl] - Optional custom frontend URL
 * @returns {Promise<{ qrCode: string, qrCodeUrl: string }>}
 */
async function generateShopkeeperQRCode(shopkeeperId, shopSlug, customFrontendUrl) {
  try {
    const qrCodeFilename = `qr-${shopSlug}-${Date.now()}.png`;
    const qrCodePath = path.join(localUploadDir, 'qrcodes', qrCodeFilename);
    
    // Ensure qrcodes directory exists
    const qrDir = path.dirname(qrCodePath);
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    // Generate QR code data
    const frontendUrl = customFrontendUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
    const qrData = `${frontendUrl}/take-a-print?shopId=${shopSlug}`;

    // Generate QR code image
    await QRCode.toFile(qrCodePath, qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Return relative URL for storage
    const qrCodeUrl = `/uploads/qrcodes/${qrCodeFilename}`;

    return {
      qrCode: qrCodeFilename,
      qrCodeUrl,
      qrData
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code data URL (for displaying in browser)
 * @param {string} shopSlug - Shop slug
 * @returns {Promise<string>} Data URL
 */
async function generateQRCodeDataUrl(shopSlug) {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const qrData = `${frontendUrl}/take-a-print?shopId=${shopSlug}`;
    
    const dataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code data URL:', error);
    throw new Error('Failed to generate QR code');
  }
}

module.exports = {
  generateShopkeeperQRCode,
  generateQRCodeDataUrl
};
