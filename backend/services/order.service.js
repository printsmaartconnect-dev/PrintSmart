const prisma = require('../config/db');

/**
 * Generate custom Order ID in format: MMDDYYTYPE/SEQUENCE
 * Example: 0526PBW01 or 0526PC02
 * MM = month, DD = day, YY = year, TYPE = print type (BW/C), SEQUENCE = auto-increment
 */
async function generateCustomOrderId(printType = 'BW') {
  try {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    
    // Map print type
    const typeCode = printType.toUpperCase() === 'COLOR' ? 'C' : 'BW';
    
    // Get current month's date range (since format is MMYYP...)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    // Count all printed files this month
    const thisMonthOrderCount = await prisma.orderFile.count({
      where: {
        order: {
          createdAt: {
            gte: startOfMonth,
            lt: endOfMonth
          }
        }
      }
    });
    
    const sequence = String(thisMonthOrderCount + 1).padStart(2, '0');
    const orderId = `${month}${year}P${typeCode}${sequence}`;
    
    return orderId;
  } catch (error) {
    console.error('Error generating order ID:', error);
    throw new Error('Failed to generate order ID');
  }
}

/**
 * Calculate estimated print time based on queue and configuration
 * @param {string} shopkeeperId - Shopkeeper ID
 * @param {Object} printConfig - Print configuration
 * @returns {Promise<number>} Estimated time in minutes
 */
async function calculateEstimatedTime(shopkeeperId, printConfig) {
  try {
    // Get queue size for this shopkeeper
    const queueSize = await prisma.queue.count({
      where: {
        order: {
          shopkeeperId
        },
        status: 'WAITING'
      }
    });

    // Base time per copy in seconds
    let baseTimePerCopy = 5; // seconds
    
    // Adjust based on print quality
    if (printConfig?.quality === 'HIGH') {
      baseTimePerCopy = 8;
    } else if (printConfig?.quality === 'DRAFT') {
      baseTimePerCopy = 3;
    }
    
    // Double-sided printing takes more time
    if (printConfig?.sides === 'DOUBLE') {
      baseTimePerCopy *= 1.5;
    }
    
    // Calculate total time
    const copies = printConfig?.copies || 1;
    const totalTimeForThisOrder = (baseTimePerCopy * copies) / 60; // Convert to minutes
    
    // Queue wait time: 2-3 minutes per order in queue
    const queueWaitTime = Math.min(queueSize * 2.5, 30); // Max 30 mins queue
    
    // Total estimated time
    const estimatedTime = Math.ceil(totalTimeForThisOrder + queueWaitTime);
    
    return Math.max(estimatedTime, 2); // Minimum 2 minutes
  } catch (error) {
    console.error('Error calculating estimated time:', error);
    return 5; // Default to 5 minutes on error
  }
}

/**
 * Update shopkeeper statistics after order completion
 * @param {string} shopkeeperId - Shopkeeper ID
 * @param {Object} orderData - Order data
 */
async function updateShopkeeperStats(shopkeeperId, orderData) {
  try {
    const {
      totalAmount,
      printConfig,
      quantity = 1
    } = orderData;

    // Get or create statistics record
    let stats = await prisma.shopkeeperStatistics.findUnique({
      where: { shopkeeperId }
    });

    if (!stats) {
      stats = await prisma.shopkeeperStatistics.create({
        data: { shopkeeperId }
      });
    }

    // Update statistics
    const isBW = printConfig?.printType === 'BW' || printConfig?.printType !== 'COLOR';
    
    const updatedStats = await prisma.shopkeeperStatistics.update({
      where: { shopkeeperId },
      data: {
        totalOrders: { increment: 1 },
        todayOrders: { increment: 1 },
        totalCopies: { increment: quantity },
        todayEarnings: { increment: totalAmount || 0 },
        monthlyRevenue: { increment: totalAmount || 0 },
        totalEarnings: { increment: totalAmount || 0 },
        ...(isBW ? { todayBWPrints: { increment: quantity } } : { todayColorPrints: { increment: quantity } })
      }
    });

    // Update shopkeeper totals
    await prisma.shopkeeper.update({
      where: { id: shopkeeperId },
      data: {
        totalOrders: { increment: 1 },
        totalEarnings: { increment: totalAmount || 0 }
      }
    });

    return updatedStats;
  } catch (error) {
    console.error('Error updating shopkeeper statistics:', error);
  }
}

module.exports = {
  generateCustomOrderId,
  calculateEstimatedTime,
  updateShopkeeperStats
};
