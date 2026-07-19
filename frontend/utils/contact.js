/**
 * Reusable utility to launch WhatsApp chat or fallback to phone dialer.
 * Also copies the contact number to the clipboard as a robust fallback.
 * Works across Android, iOS, and Web.
 * 
 * @param {string} phoneNumber - The phone number with country code (e.g. "+918767877602")
 */
export function launchWhatsAppOrCall(phoneNumber = '+918767877602') {
  const cleanNumber = phoneNumber.replace(/[^\d]/g, '');

  // 1. Copy number to clipboard as fallback if supported
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(`+${cleanNumber}`)
        .then(() => console.log('Phone number copied to clipboard as fallback'))
        .catch(err => console.warn('Could not copy phone number to clipboard:', err));
    }
  } catch (e) {
    console.warn('Clipboard access failed:', e);
  }

  // 2. Open WhatsApp deep link or fallback to phone dialer
  let openedApp = false;

  const handleBlur = () => {
    openedApp = true;
  };

  window.addEventListener('blur', handleBlur);

  // Try opening deep link.
  window.location.href = `whatsapp://send?phone=${cleanNumber}`;

  // Check after 1.5 seconds if page blurred (meaning WhatsApp app opened).
  setTimeout(() => {
    window.removeEventListener('blur', handleBlur);
    if (!openedApp) {
      // Fallback to phone dialer
      window.location.href = `tel:+${cleanNumber}`;
    }
  }, 1500);
}
