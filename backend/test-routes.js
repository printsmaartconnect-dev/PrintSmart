const path = require("path");

console.log("Starting backend routes diagnostic check...");

const routesToTest = [
  "./routes/auth.routes",
  "./routes/file.routes",
  "./routes/order.routes",
  "./routes/queue.routes",
  "./routes/feedback.routes",
  "./routes/statistics.routes",
  "./routes/user.routes",
  "./routes/shopkeeper.routes",
  "./routes/admin.routes",
  "./routes/ai.routes",
  "./routes/reward.routes",
  "./routes/payment.routes"
];

let failed = false;

routesToTest.forEach(route => {
  try {
    console.log(`Testing import of: ${route}...`);
    require(route);
    console.log(`SUCCESS: ${route} loaded fine.`);
  } catch (err) {
    console.error(`ERROR: Failed to load ${route}:`, err.message);
    if (err.stack) {
      console.error(err.stack);
    }
    failed = true;
  }
});

if (failed) {
  console.error("DIAGNOSTIC FAILED: One or more routes failed to load.");
  process.exit(1);
} else {
  console.log("DIAGNOSTIC SUCCESS: All route files loaded successfully with no import or syntax errors.");
  process.exit(0);
}
