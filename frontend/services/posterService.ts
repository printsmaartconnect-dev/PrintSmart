import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Generates and downloads a high-resolution PDF of the QR poster.
 * @param elementId The DOM ID of the poster element
 * @param shopId The shop keeper ID code (used in filename)
 */
export const downloadPosterAsPDF = async (elementId: string, shopId: string): Promise<boolean> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Poster element with ID '${elementId}' not found in DOM.`);
    return false;
  }

  try {
    // Generate high-resolution canvas: use scale=1 for high-res 2480px template, scale=3 for low-res
    const isHighRes = element.offsetWidth > 1500;
    const canvas = await html2canvas(element, {
      scale: isHighRes ? 1 : 3, 
      useCORS: true, 
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');

    // Create A4 PDF (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
    pdf.save(`PrintSmart_QR_${shopId || 'code'}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

/**
 * Renders the QR poster element and opens the browser print dialog.
 * @param elementId The DOM ID of the poster element
 */
export const printPoster = async (elementId: string): Promise<boolean> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Poster element with ID '${elementId}' not found in DOM.`);
    return false;
  }

  try {
    // Generate high-resolution canvas: use scale=1 for high-res 2480px template, scale=2 for low-res
    const isHighRes = element.offsetWidth > 1500;
    const canvas = await html2canvas(element, {
      scale: isHighRes ? 1 : 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');

    // Open print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked! Please allow pop-ups to print the poster.');
      return false;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Poster</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background-color: #ffffff;
            }
            img {
              max-width: 100%;
              max-height: 100vh;
              height: auto;
              object-fit: contain;
            }
            @page {
              size: A4 portrait;
              margin: 0;
            }
            @media print {
              body {
                margin: 0;
              }
              img {
                width: 100%;
                height: 100%;
                max-height: 100%;
              }
            }
          </style>
        </head>
        <body>
          <img src="${imgData}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
    return true;
  } catch (error) {
    console.error('Error printing poster:', error);
    return false;
  }
};
