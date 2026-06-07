require("dotenv").config();
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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    storage: process.env.AWS_ACCESS_KEY_ID ? "s3" : "local",
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
