const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const localUploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');

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

    const pdfFilename = `invoice-${orderId}-${Date.now()}.pdf`;
    const pdfPath = path.join(invoiceDir, pdfFilename);
    const writeStream = fs.createWriteStream(pdfPath);

    doc.pipe(writeStream);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Invoice #: ${invoiceNumber}`, { align: 'center' });
    doc.text(`Date: ${new Date(createdAt).toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);

    // Shop Info
    doc.fontSize(11).font('Helvetica-Bold').text('FROM:');
    doc.fontSize(10).font('Helvetica')
      .text(shopName || 'PrintShop')
      .text(shopAddress || 'Address not available')
      .text(`Phone: ${shopPhone || 'N/A'}`);
    doc.moveDown(1);

    // Customer Info
    doc.fontSize(11).font('Helvetica-Bold').text('BILL TO:');
    doc.fontSize(10).font('Helvetica')
      .text(customerName || 'Customer')
      .text(`Phone: ${phone || 'N/A'}`);
    doc.moveDown(1);

    // Order Details
    doc.fontSize(11).font('Helvetica-Bold').text('ORDER DETAILS:');
    doc.fontSize(10).font('Helvetica')
      .text(`Order ID: ${orderId}`)
      .text(`Print Type: ${printConfig?.printType === 'BW' ? 'Black & White' : 'Color'}`)
      .text(`Paper Size: ${printConfig?.paperSize || 'A4'}`)
      .text(`Copies: ${printConfig?.copies || 1}`)
      .text(`Print Side: ${printConfig?.sides === 'DOUBLE' ? 'Double Sided' : 'Single Sided'}`);
    doc.moveDown(1);

    // Files section
    doc.fontSize(11).font('Helvetica-Bold').text('FILES:');
    if (files && files.length > 0) {
      files.forEach((file, idx) => {
        doc.fontSize(10).font('Helvetica').text(`${idx + 1}. ${file.customFileName || file.originalFileName}`);
      });
    }
    doc.moveDown(1);

    // Financial Summary
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    
    doc.fontSize(10).font('Helvetica')
      .text(`Subtotal: ₹${subtotal?.toFixed(2) || '0.00'}`, 400)
      .text(`Tax (GST): ₹${tax?.toFixed(2) || '0.00'}`, 400)
      .text(`Discount: -₹${discount?.toFixed(2) || '0.00'}`, 400);
    
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);
    
    doc.fontSize(12).font('Helvetica-Bold').text(`TOTAL: ₹${totalAmount?.toFixed(2) || '0.00'}`, 400);
    
    doc.moveDown(2);

    // Footer
    doc.fontSize(9).font('Helvetica')
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
