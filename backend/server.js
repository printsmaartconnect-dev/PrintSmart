require("dotenv").config();
<<<<<<< Updated upstream
=======
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

// 1. Programmatically install, sync DB, and compile TypeScript files on server boot
try {
  const backendDir = path.resolve(__dirname);
  const rootDir = path.resolve(backendDir, "..");
  fs.rmSync(path.join(rootDir, "revert.js"), { force: true });
  fs.rmSync(path.join(rootDir, "revert_log.txt"), { force: true });
  
  // Push prisma DB schema first to regenerate the Prisma Client
  console.log("Running prisma db push programmatically at startup...");
  execSync("npx prisma db push", { cwd: backendDir, stdio: "inherit" });
  console.log("Prisma db push completed successfully.");

  // Create output directory for compiled JS if not exists
  const distDir = path.join(backendDir, "dist");
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Check if typescript npm package is available
  if (!fs.existsSync(path.join(backendDir, "node_modules", "typescript"))) {
    console.log("Typescript compiler not found. Installing typescript dependencies...");
    execSync("npm install typescript @types/node @types/express --save-dev", { cwd: backendDir, stdio: "inherit" });
  }

  console.log("Compiling PrintSmart AI Copilot TypeScript services...");
  execSync("npx tsc", { cwd: backendDir, stdio: "inherit" });
  console.log("TypeScript compilation completed successfully.");

  // Check and install socket.io in backend
  if (!fs.existsSync(path.join(backendDir, "node_modules", "socket.io"))) {
    console.log("socket.io not found. Installing socket.io in backend...");
    execSync("npm install socket.io", { cwd: backendDir, stdio: "inherit" });
  }

  // Check and install razorpay in backend
  if (!fs.existsSync(path.join(backendDir, "node_modules", "razorpay"))) {
    console.log("razorpay not found. Installing razorpay in backend...");
    execSync("npm install razorpay", { cwd: backendDir, stdio: "inherit" });
  }

  // Check and install socket.io-client in frontend
  const frontendDir = path.resolve(rootDir, "frontend");
  if (!fs.existsSync(path.join(frontendDir, "node_modules", "socket.io-client"))) {
    console.log("socket.io-client not found. Installing socket.io-client in frontend...");
    execSync("npm install socket.io-client", { cwd: frontendDir, stdio: "inherit" });
  }

  // Remove conflicting pnpm-lock.yaml to prevent Vercel build errors
  const pnpmLock = path.join(frontendDir, "pnpm-lock.yaml");
  if (fs.existsSync(pnpmLock)) {
    console.log("Conflicting pnpm-lock.yaml found in frontend. Deleting...");
    fs.rmSync(pnpmLock, { force: true });
  }
} catch (err) {
  console.error("Prisma DB sync, TypeScript compilation or Socket.IO setup failed on startup:", err.message);
}

// 2. Load standard Express route imports (ensuring dist/ folder is populated)
>>>>>>> Stashed changes
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const authRoutes = require("./routes/auth.routes");
const fileRoutes = require("./routes/file.routes");
const orderRoutes = require("./routes/order.routes");
const queueRoutes = require("./routes/queue.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const statisticsRoutes = require("./routes/statistics.routes");
const userRoutes = require("./routes/user.routes");
const shopkeeperRoutes = require("./routes/shopkeeper.routes");
const adminRoutes = require("./routes/admin.routes");
const aiRoutes = require("./routes/ai.routes");
const rewardRoutes = require("./routes/reward.routes");
const paymentRoutes = require("./routes/payment.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Auto-install xlsx and convert Excel to CSV on startup
const { exec } = require('child_process');
const backendDir = path.resolve(__dirname);

function runExcelConversion() {
  try {
    const XLSX = require('xlsx');
    const excelPath = path.join(backendDir, 'Card', 'Do You Know,Astrology.xlsx');
    if (!fs.existsSync(excelPath)) {
      console.error('Excel file not found at:', excelPath);
      return;
    }

    const workbook = XLSX.readFile(excelPath);
    console.log('Excel Sheets found:', workbook.SheetNames);
    
    const didYouKnowSheetName = workbook.SheetNames.find(s => {
      const clean = s.toLowerCase().replace(/[\s_-]/g, '');
      return clean === 'doyouknow' || clean === 'didyouknow';
    });
    const astrologySheetName = workbook.SheetNames.find(s => {
      const clean = s.toLowerCase().replace(/[\s_-]/g, '');
      return clean === 'astrology';
    });
    
    const targetDir = path.join(backendDir, 'assets', 'csv');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    if (didYouKnowSheetName) {
      const sheet = workbook.Sheets[didYouKnowSheetName];
      const csvContent = XLSX.utils.sheet_to_csv(sheet);
      fs.writeFileSync(path.join(targetDir, 'did_you_know.csv'), csvContent, 'utf8');
      console.log('Successfully extracted did_you_know.csv from Excel sheet:', didYouKnowSheetName);
    } else {
      console.warn('Do You Know sheet not found in Excel. Sheet names:', workbook.SheetNames);
    }
    
    if (astrologySheetName) {
      const sheet = workbook.Sheets[astrologySheetName];
      const csvContent = XLSX.utils.sheet_to_csv(sheet);
      fs.writeFileSync(path.join(targetDir, 'astrology.csv'), csvContent, 'utf8');
      console.log('Successfully extracted astrology.csv from Excel sheet:', astrologySheetName);
    } else {
      console.warn('Astrology sheet not found in Excel. Sheet names:', workbook.SheetNames);
    }
    
    // Trigger CSV loader update
    try {
      const csvService = require("./services/csv.service");
      csvService.loadCSVFiles();
    } catch (loadErr) {
      console.error('Error reloading CSV files:', loadErr);
    }
  } catch (err) {
    console.error('Failed to convert Excel to CSV:', err);
  }
}

if (!fs.existsSync(path.join(backendDir, 'node_modules', 'xlsx'))) {
  console.log('xlsx library not found. Auto-installing xlsx package...');
  exec('npm install xlsx', { cwd: backendDir }, (err, stdout, stderr) => {
    if (err) {
      console.error('Auto-installation of xlsx failed:', err);
    } else {
      console.log('xlsx installed successfully.');
      runExcelConversion();
    }
  });
} else {
  runExcelConversion();
}

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Ensure local uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files statically for local fallback storage
app.use("/uploads", express.static(uploadDir));

// Route handlers
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/shopkeeper", shopkeeperRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/payment", paymentRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    storage: process.env.AWS_ACCESS_KEY_ID ? "s3" : "local",
  });
});

// S3 Debug diagnostic endpoint
app.get("/debug/s3", async (req, res) => {
  const region = process.env.AWS_REGION || "ap-south-1";
  const bucket = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET;
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  
  let canConnect = "no";
  let bucketAccessible = "no";
  let errorDetails = null;

  if (accessKey && secretKey && bucket) {
    try {
      const { S3Client, ListBucketsCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
      const s3Client = new S3Client({
        region: region,
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
      });

      // Check if can connect
      try {
        await s3Client.send(new ListBucketsCommand({}));
        canConnect = "yes";
      } catch (err) {
        errorDetails = { 
          command: "ListBuckets", 
          message: err.message, 
          name: err.name,
          code: err.code,
          stringToSign: err.StringToSign || err.stringToSign || err.StringToSignBytes || null,
          canonicalRequest: err.CanonicalRequest || err.canonicalRequest || null,
          rawError: JSON.parse(JSON.stringify(err)),
          metadata: err.$metadata
        };
      }

      // Check if bucket accessible
      try {
        const command = new PutObjectCommand({
          Bucket: bucket,
          Key: "debug/s3-connection-check.txt",
          Body: "PrintSmart Diagnostic Check",
          ContentType: "text/plain",
        });
        await s3Client.send(command);
        bucketAccessible = "yes";
      } catch (err) {
        if (!errorDetails) {
          errorDetails = { 
            command: "PutObject", 
            message: err.message, 
            name: err.name,
            code: err.code,
            stringToSign: err.StringToSign || err.stringToSign || err.StringToSignBytes || null,
            canonicalRequest: err.CanonicalRequest || err.canonicalRequest || null,
            rawError: JSON.parse(JSON.stringify(err)),
            metadata: err.$metadata
          };
        }
      }
    } catch (err) {
      errorDetails = { command: "Initialization", message: err.message };
    }
  }

  res.json({
    currentRegion: region,
    bucket: bucket || "not_configured",
    sdkVersion: "AWS SDK v3 (@aws-sdk/client-s3)",
    credentialSource: accessKey ? "process.env" : "none",
    canConnect: canConnect,
    bucketAccessible: bucketAccessible,
    errorDetails: errorDetails
  });
});

// Root fallback route
app.use((req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// Start listening
app.listen(PORT, async () => {
  console.log(`PrintSmart backend running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);

  // DNS Diagnostics
  try {
    const dns = require('dns');
    dns.lookup('db.hqlnmdtsdmehfsfjtucd.supabase.co', (err, address, family) => {
      if (err) console.error('DNS LOOKUP ERROR FOR SUPABASE:', err.message);
      else console.log(`DNS LOOKUP SUCCESS: IP=${address}, Family=IPv${family}`);
    });
  } catch (dnsErr) {
    console.error('DNS test setup failed:', dnsErr.message);
  }

  // Seed default shopkeeper details on start
  try {
    const seedService = require("./services/seed.service");
    await seedService.seedDefaultShopkeeper();
  } catch (seedErr) {
    console.error("Failed to run seed service on startup:", seedErr);
  }
});
// Nodemon reload trigger: updated database connection string in .env
