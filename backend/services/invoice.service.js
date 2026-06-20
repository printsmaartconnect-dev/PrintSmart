const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { formatCurrency } = require('../utils/currency');

const localUploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
const fontDir = path.join(__dirname, '..', 'assets', 'fonts');
const regularFontPath = path.join(fontDir, 'NotoSans-Regular.ttf');
const boldFontPath = path.join(fontDir, 'NotoSans-Bold.ttf');

let fontDownloadPromise = null;

/**
 * Helper to download a file, supporting redirects
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        fs.unlink(destPath, () => {});
        downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(destPath, () => {});
        reject(new Error(`Failed to download file: status code ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

/**
 * Ensures Noto Sans Regular and Bold fonts are available locally
 * @returns {Promise<boolean>} True if fonts are successfully loaded or downloaded, false otherwise
 */
async function ensureFonts() {
  if (fs.existsSync(regularFontPath) && fs.existsSync(boldFontPath)) {
    return true;
  }
  
  if (fontDownloadPromise) {
    return fontDownloadPromise;
  }

  fontDownloadPromise = (async () => {
    try {
      if (!fs.existsSync(fontDir)) {
        fs.mkdirSync(fontDir, { recursive: true });
      }

      const regularUrl = 'https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf';
      const boldUrl = 'https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf';

      // Download Regular Font if missing
      if (!fs.existsSync(regularFontPath)) {
        await downloadFile(regularUrl, regularFontPath);
        console.log('Downloaded NotoSans-Regular.ttf successfully.');
      }

      // Download Bold Font if missing
      if (!fs.existsSync(boldFontPath)) {
        await downloadFile(boldUrl, boldFontPath);
        console.log('Downloaded NotoSans-Bold.ttf successfully.');
      }

      return true;
    } catch (err) {
      console.error('Failed to download NotoSans fonts, falling back to system fonts:', err);
      // Clean up failed partial downloads
      try {
        if (fs.existsSync(regularFontPath)) fs.unlinkSync(regularFontPath);
        if (fs.existsSync(boldFontPath)) fs.unlinkSync(boldFontPath);
      } catch (cleanupErr) {
        console.error('Cleanup error:', cleanupErr);
      }
      return false;
    } finally {
      fontDownloadPromise = null;
    }
  })();

  return fontDownloadPromise;
}

/**
 * Generate invoice number in format: MMDDYYNNNNN
 * @param {number} sequenceNumber - Sequence number for the day
 * @returns {string} Invoice number
 */
function generateInvoiceNumber(sequenceNumber = 1) {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const sequence = String(sequenceNumber).padStart(5, '0');
  
  return `INV-${month}${day}${year}${sequence}`;
}

/**
 * Generate PDF invoice
 * @param {Object} orderData - Order details
 * @returns {Promise<{ pdfPath: string, pdfUrl: string, invoiceNumber: string }>}
 */
async function generateInvoicePDF(orderData) {
  try {
    const {
      orderId,
      customerName,
      phone,
      shopName,
      shopAddress,
      shopPhone,
      files,
      printConfig,
      subtotal,
      tax,
      discount,
      totalAmount,
      createdAt
    } = orderData;

    // Create invoices directory if not exists
    const invoiceDir = path.join(localUploadDir, 'invoices');
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber(Date.now() % 100000);
    
    // Create PDF document
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4'
    });

    // Ensure fonts are available
    let fontRegular = 'Helvetica';
    let fontBold = 'Helvetica-Bold';
    let useUnicode = false;

    try {
      const fontsAvailable = await ensureFonts();
      if (fontsAvailable && fs.existsSync(regularFontPath) && fs.existsSync(boldFontPath)) {
        doc.registerFont('NotoSans', regularFontPath);
        doc.registerFont('NotoSans-Bold', boldFontPath);
        fontRegular = 'NotoSans';
        fontBold = 'NotoSans-Bold';
        useUnicode = true;
      }
    } catch (fontErr) {
      console.error('Error registering custom fonts, falling back to Helvetica:', fontErr);
    }

    const pdfFilename = `invoice-${orderId}-${Date.now()}.pdf`;
    const pdfPath = path.join(invoiceDir, pdfFilename);
    const writeStream = fs.createWriteStream(pdfPath);

    doc.pipe(writeStream);

    // Header
    doc.fontSize(24).font(fontBold).text('INVOICE', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font(fontRegular).text(`Invoice #: ${invoiceNumber}`, { align: 'center' });
    doc.text(`Date: ${new Date(createdAt).toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);

    // Shop Info
    doc.fontSize(11).font(fontBold).text('FROM:');
    doc.fontSize(10).font(fontRegular)
      .text(shopName || 'PrintShop')
      .text(shopAddress || 'Address not available')
      .text(`Phone: ${shopPhone || 'N/A'}`);
    doc.moveDown(1);

    // Customer Info
    doc.fontSize(11).font(fontBold).text('BILL TO:');
    doc.fontSize(10).font(fontRegular)
      .text(customerName || 'Customer')
      .text(`Phone: ${phone || 'N/A'}`);
    doc.moveDown(1);

    // Order Details
    doc.fontSize(11).font(fontBold).text('ORDER DETAILS:');
    doc.fontSize(10).font(fontRegular)
      .text(`Order ID: ${orderId}`)
      .text(`Print Type: ${printConfig?.printType === 'BW' ? 'Black & White' : 'Color'}`)
      .text(`Paper Size: ${printConfig?.paperSize || 'A4'}`)
      .text(`Copies: ${printConfig?.copies || 1}`)
      .text(`Print Side: ${printConfig?.sides === 'DOUBLE' ? 'Double Sided' : 'Single Sided'}`);
    doc.moveDown(1);

    // Files Table section
    doc.fontSize(11).font(fontBold).text('ITEMIZED PRINT BILLING:');
    doc.moveDown(0.5);

    // Draw Table Header
    const tableHeaderY = doc.y;
    doc.fontSize(9).font(fontBold);
    doc.text('Order ID', 50, tableHeaderY);
    doc.text('File Name', 140, tableHeaderY);
    doc.text('Print Details & Copies', 320, tableHeaderY);
    doc.text('Amount', 470, tableHeaderY, { align: 'right', width: 70 });
    
    doc.moveDown(0.4);
    doc.moveTo(50, doc.y).lineTo(540, doc.y).stroke();
    doc.moveDown(0.6);

    // Draw Table Rows
    if (files && files.length > 0) {
      files.forEach((file, idx) => {
        let displayName = file.customFileName || file.originalFileName;
        let fileId = orderId; // fallback to main orderId
        let itemPrice = totalAmount; // fallback to overall
        let fileConfig = printConfig;

        if (displayName && displayName.includes('|')) {
          try {
            const parts = displayName.split('|');
            displayName = parts[0];
            const parsedConfig = JSON.parse(parts[1]);
            if (parsedConfig) {
              fileId = parsedConfig.orderId || fileId;
              itemPrice = parsedConfig.price !== undefined ? parseFloat(parsedConfig.price) : itemPrice;
              fileConfig = parsedConfig;
            }
          } catch (e) {
            console.error("Error parsing serialized file config in invoice generation", e);
          }
        }

        // Shorten long file names so they don't overlap other columns
        if (displayName.length > 25) {
          displayName = displayName.substring(0, 22) + '...';
        }

        const copies = fileConfig?.copies || 1;
        const type = fileConfig?.printType === 'COLOR' ? 'Color' : 'B&W';
        const size = fileConfig?.paperSize || 'A4';
        const sides = fileConfig?.sides === 'DOUBLE' ? 'Double' : 'Single';
        const detailsStr = `${copies}x ${type} (${size}, ${sides})`;

        const rowY = doc.y;
        doc.fontSize(9).font(fontRegular);
        doc.text(fileId, 50, rowY);
        doc.text(displayName, 140, rowY);
        doc.text(detailsStr, 320, rowY);
        doc.text(formatCurrency(itemPrice, useUnicode), 470, rowY, { align: 'right', width: 70 });
        
        doc.moveDown(1.2); // space for next row
      });
    }

    doc.moveTo(50, doc.y).lineTo(540, doc.y).stroke();
    doc.moveDown(1);

    // Financial Summary
    doc.moveTo(50, doc.y).lineTo(540, doc.y).stroke();
    doc.moveDown(0.5);
    
    doc.fontSize(10).font(fontRegular);
    
    const summaryX = 350;
    const valueX = 470;
    const valueWidth = 70;
    
    // Subtotal (pre-discount amount to avoid displaying tax detail)
    const invoiceSubtotal = orderData.price !== undefined ? orderData.price : (totalAmount + (discount || 0));

    // Subtotal Row
    let curY = doc.y;
    doc.text('Subtotal:', summaryX, curY);
    doc.text(formatCurrency(invoiceSubtotal, useUnicode), valueX, curY, { align: 'right', width: valueWidth });
    doc.moveDown(0.5);
    
    // Discount Row
    if (discount > 0) {
      curY = doc.y;
      doc.text('Discount:', summaryX, curY);
      doc.text(`- ${formatCurrency(discount, useUnicode)}`, valueX, curY, { align: 'right', width: valueWidth });
      doc.moveDown(0.5);
    }
    
    doc.moveDown(0.2);
    doc.moveTo(350, doc.y).lineTo(540, doc.y).stroke();
    doc.moveDown(0.4);
    
    // Total Row
    curY = doc.y;
    doc.fontSize(11).font(fontBold);
    doc.text('Grand Total:', summaryX, curY);
    doc.text(formatCurrency(totalAmount || 0, useUnicode), valueX, curY, { align: 'right', width: valueWidth });
    
    doc.moveDown(2);

    // Footer
    doc.fontSize(9).font(fontRegular)
      .text('Thank you for your order!', { align: 'center' })
      .text('For any queries, contact us at the above address.', { align: 'center' });

    // Finalize PDF
    doc.end();

    // Return promise that resolves when PDF is written
    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        const pdfUrl = `/uploads/invoices/${pdfFilename}`;
        resolve({
          pdfPath,
          pdfUrl,
          invoiceNumber,
          pdfFilename
        });
      });

      writeStream.on('error', reject);
      doc.on('error', reject);
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    throw new Error('Failed to generate invoice PDF');
  }
}

module.exports = {
  generateInvoicePDF,
  generateInvoiceNumber
};
