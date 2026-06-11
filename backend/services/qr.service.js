const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const localUploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');

/**
 * Generate a unique QR code for a shopkeeper
 * @param {string} shopId - Shopkeeper UUID
 * @param {string} shopSlug - Shopkeeper custom slug or ID code
 * @returns {Promise<{ qrCodeUrl: string, qrValue: string }>}
 */
async function generateShopQr(shopId, shopSlug) {
  try {
    const codeToUse = shopSlug || shopId;
    const qrFilename = `qr-${codeToUse}-${Date.now()}.png`;
    const qrPath = path.join(localUploadDir, 'qrs', qrFilename);
    
    // Ensure uploads/qrs directory exists
    const qrsDir = path.dirname(qrPath);
    if (!fs.existsSync(qrsDir)) {
      fs.mkdirSync(qrsDir, { recursive: true });
    }

    // Customer flow landing page URL containing the shopId parameter
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const qrValue = `${frontendUrl}/take-a-print?shopId=${codeToUse}`;

    // Generate and save QR image file
    await QRCode.toFile(qrPath, qrValue, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Public URL path
    const qrCodeUrl = `/uploads/qrs/${qrFilename}`;

    return {
      qrCodeUrl,
      qrValue
    };
  } catch (error) {
    console.error('Error generating shop QR:', error);
    throw new Error('Failed to generate shop QR');
  }
}

module.exports = {
  generateShopQr
};
