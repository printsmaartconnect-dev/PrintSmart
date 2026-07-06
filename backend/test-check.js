const prisma = require("./config/db");
const fs = require("fs");
const path = require("path");

async function check() {
  try {
    console.log("Checking database shopkeepers...");
    const shopkeepers = await prisma.shopkeeper.findMany({
      select: {
        id: true,
        shopName: true,
        shopSlug: true,
        shopkeeperIdCode: true,
        qrCodeUrl: true,
        qrValue: true
      }
    });

    console.log(`Found ${shopkeepers.length} shopkeeper(s) in Supabase.`);
    
    for (const shop of shopkeepers) {
      console.log(`\n----------------------------------------`);
      console.log(`Shop: ${shop.shopName}`);
      console.log(`Slug: ${shop.shopSlug}`);
      console.log(`UUID ID: ${shop.id}`);
      console.log(`IdCode: ${shop.shopkeeperIdCode}`);
      console.log(`DB qrCodeUrl: ${shop.qrCodeUrl}`);
      console.log(`DB qrValue: ${shop.qrValue}`);
      
      if (shop.qrCodeUrl) {
        const localUploadDir = path.resolve('./uploads');
        const relativePath = shop.qrCodeUrl.replace(/^\/uploads\//, "");
        const absolutePath = path.join(localUploadDir, relativePath);
        const exists = fs.existsSync(absolutePath);
        console.log(`File path: ${absolutePath}`);
        console.log(`File exists on local disk: ${exists ? "YES" : "NO"}`);
        if (exists) {
          console.log(`File size: ${fs.statSync(absolutePath).size} bytes`);
        }
      } else {
        console.log("No qrCodeUrl set in DB.");
      }
    }
    console.log(`----------------------------------------`);
  } catch (err) {
    console.error("Error during check:", err);
  } finally {
    process.exit(0);
  }
}

check();
