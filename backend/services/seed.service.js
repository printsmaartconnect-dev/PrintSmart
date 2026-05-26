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

      console.log(`Default shopkeeper seeded successfully!`);
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log(`Shop Slug: ${shopSlug}`);
      console.log(`QR Scanner URL: /take-a-print?shopId=${shopSlug}`);
    } else {
      console.log("Database contains registered shopkeepers. Skipping seed.");
    }
  } catch (error) {
    console.error("Error seeding default shopkeeper:", error);
  }
}

module.exports = {
  seedDefaultShopkeeper
};
