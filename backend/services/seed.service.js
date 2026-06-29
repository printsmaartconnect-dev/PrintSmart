const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const qrcodeService = require("./qrcode.service");

// Seed default shopkeeper if none exists in the database
async function seedDefaultShopkeeper() {
  try {
    const count = await prisma.shopkeeper.count();
    if (count === 0) {
      console.log("No shopkeepers found in the database. Seeding default shopkeeper...");
      
      const email = "defaultshop@printsmart.com";
      const password = "password123";
      const phone = "9876543210";
      const shopName = "Smart Print Hub";
      const shopSlug = "smart-print-hub";

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create shopkeeper
      const shopkeeper = await prisma.shopkeeper.create({
        data: {
          email,
          phone,
          password: hashedPassword,
          shopName,
          shopSlug,
          shopkeeperIdCode: "smart-print-hub",
          ownerName: "Admin Owner",
          address: "123 University Road, Tech Campus",
          category: "Printing & Photocopy",
          subCategory: "Xerox & Digital Prints",
          languagePref: "English",
          pricing: {
            bwA4: "1.00",
            bwA3: "2.00",
            bwDoubleSide: "1.00",
            colorA4: "5.00",
            colorA3: "8.00",
            colorDoubleSide: "3.00",
            expressPrint: "10.00",
            autoDeleteAfterHours: "24 hrs"
          }
        }
      });

      // Generate QR Code details
      let qrCode = null;
      let qrCodeUrl = null;
      try {
        const qrResult = await qrcodeService.generateShopkeeperQRCode(shopkeeper.id, shopSlug);
        qrCode = qrResult.qrCode;
        qrCodeUrl = qrResult.qrCodeUrl;

        await prisma.shopkeeper.update({
          where: { id: shopkeeper.id },
          data: { qrCode, qrCodeUrl }
        });
      } catch (qrErr) {
        console.error("QR Code generation failed for seed shopkeeper:", qrErr);
      }

      // Seed statistics
      await prisma.shopkeeperStatistics.create({
        data: {
          shopkeeperId: shopkeeper.id,
          totalOrders: 0,
          totalEarnings: 0
        }
      });

      // Seed initial Inventory Items
      await prisma.inventoryItem.createMany({
        data: [
          { shopkeeperId: shopkeeper.id, itemName: "Paper A4 Pack", quantity: 12, unit: "packs", minThreshold: 5 },
          { shopkeeperId: shopkeeper.id, itemName: "Toner Cartridge", quantity: 4, unit: "cartridges", minThreshold: 2 },
          { shopkeeperId: shopkeeper.id, itemName: "Glossy Photo Paper", quantity: 3, unit: "packs", minThreshold: 4 }, // low stock
          { shopkeeperId: shopkeeper.id, itemName: "Spiral Binding Rings", quantity: 50, unit: "pcs", minThreshold: 15 }
        ]
      });

      // Seed initial Printer Statistics
      await prisma.printerStatistics.createMany({
        data: [
          { shopkeeperId: shopkeeper.id, printerName: "HP LaserJet Pro 400", pagesPrinted: 12450, inkLevel: 82.5, status: "ONLINE" },
          { shopkeeperId: shopkeeper.id, printerName: "Epson L3250 EcoTank", pagesPrinted: 9800, inkLevel: 12.0, status: "ONLINE" } // low ink
        ]
      });

      console.log(`Default shopkeeper seeded successfully with initial inventory and printer statistics!`);
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log(`Shop Slug: ${shopSlug}`);
      console.log(`QR Scanner URL: /take-a-print?shopId=${shopSlug}`);
    } else {
      // If shopkeeper exists, check if inventory is empty and seed it just in case
      const defaultShop = await prisma.shopkeeper.findFirst({ where: { email: "defaultshop@printsmart.com" } });
      if (defaultShop) {
        const invCount = await prisma.inventoryItem.count({ where: { shopkeeperId: defaultShop.id } });
        if (invCount === 0) {
          await prisma.inventoryItem.createMany({
            data: [
              { shopkeeperId: defaultShop.id, itemName: "Paper A4 Pack", quantity: 12, unit: "packs", minThreshold: 5 },
              { shopkeeperId: defaultShop.id, itemName: "Toner Cartridge", quantity: 4, unit: "cartridges", minThreshold: 2 },
              { shopkeeperId: defaultShop.id, itemName: "Glossy Photo Paper", quantity: 3, unit: "packs", minThreshold: 4 },
              { shopkeeperId: defaultShop.id, itemName: "Spiral Binding Rings", quantity: 50, unit: "pcs", minThreshold: 15 }
            ]
          });
        }
        const prnCount = await prisma.printerStatistics.count({ where: { shopkeeperId: defaultShop.id } });
        if (prnCount === 0) {
          await prisma.printerStatistics.createMany({
            data: [
              { shopkeeperId: defaultShop.id, printerName: "HP LaserJet Pro 400", pagesPrinted: 12450, inkLevel: 82.5, status: "ONLINE" },
              { shopkeeperId: defaultShop.id, printerName: "Epson L3250 EcoTank", pagesPrinted: 9800, inkLevel: 12.0, status: "ONLINE" }
            ]
          });
        }
      }
      console.log("Database contains registered shopkeepers. Skipping seed.");
    }
  } catch (error) {
    console.error("Error seeding default shopkeeper:", error);
  }
}

module.exports = {
  seedDefaultShopkeeper
};
