require("dotenv").config();
const storageService = require("./services/storage.service");

async function test() {
  const fileUrl = "https://printsmart-storage-rugved.s3.ap-southeast-2.amazonaws.com/test-folder/test.txt";
  const filename = "custom-test-download.txt";
  try {
    const signedUrl = await storageService.getPresignedUrl(fileUrl, filename);
    console.log("Generated Signed URL:\n", signedUrl);
  } catch (err) {
    console.error("Error generating signed URL:", err);
  }
}

test();
