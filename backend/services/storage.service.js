const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Determine S3 Configuration status
const isS3Configured = !!(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  (process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_NAME)
);

if (!isS3Configured) {
  console.warn("[S3] AWS credentials missing — using local storage fallback");
}

let s3Client = null;
if (isS3Configured) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

// Local fallback uploads directory setup
const localUploadDir = path.resolve(process.env.UPLOAD_DIR || "./uploads");
// Save customer uploaded documents inside backend/uploads/orders/
const localOrdersDir = path.join(localUploadDir, "orders");

if (!fs.existsSync(localOrdersDir)) {
  fs.mkdirSync(localOrdersDir, { recursive: true });
}

/**
 * Uploads a file (from multer memoryStorage) to S3, or falls back to local uploads/orders/
 * 
 * Future ready folder structures (comments only):
 * - shopkeepers/
 * - invoices/
 * - thumbnails/
 * - qrcodes/
 * 
 * @param {Express.Multer.File} file - Multer memory file object
 * @param {string} [orderId] - Optional associated order identifier
 * @returns {Promise<{ fileUrl: string, storageType: 's3'|'local', key: string }>}
 */
async function uploadFile(file, orderId) {
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const uuidFilename = `${uuidv4()}${fileExtension}`;

  if (isS3Configured) {
    try {
      const bucketName = process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_NAME;
      const folderId = orderId ? orderId : "temp";
      const key = `orders/${folderId}/${uuidFilename}`;

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(command);
      console.log("[S3] Upload success");
      console.log("[S3] Using cloud storage");

      const region = process.env.AWS_REGION || "ap-south-1";
      const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

      return {
        fileUrl,
        storageType: "s3",
        key,
      };
    } catch (s3Error) {
      console.error(`[S3] Upload error: ${s3Error.message}`);
      console.error("[S3] Error Details:", {
        name: s3Error.name,
        code: s3Error.code,
        metadata: s3Error.$metadata,
        stack: s3Error.stack
      });
      console.log("[S3] Falling back to local storage");
      // Intentionally fall through to local fallback below
    }
  }

  // Local fallback flow
  const key = `orders/${uuidFilename}`;
  const targetPath = path.join(localOrdersDir, uuidFilename);
  
  fs.writeFileSync(targetPath, file.buffer);
  
  const port = process.env.PORT || 5000;
  const serverUrl = process.env.FRONTEND_URL ? `http://localhost:${port}` : `http://localhost:${port}`;
  const fileUrl = `${serverUrl}/uploads/orders/${uuidFilename}`;
  
  return {
    fileUrl,
    storageType: "local",
    key,
  };
}

/**
 * Deletes a file from the active storage provider.
 * @param {string} key 
 * @returns {Promise<void>}
 */
async function deleteFile(key) {
  if (isS3Configured) {
    try {
      const bucketName = process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_NAME;
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      await s3Client.send(command);
    } catch (err) {
      console.error(`[S3] Delete error for key ${key}:`, err.message);
    }
  } else {
    const filePath = path.join(localUploadDir, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

/**
 * Resolves/gets the access URL for a given file key.
 * @param {string} key 
 * @returns {string}
 */
function getFileUrl(key) {
  if (isS3Configured) {
    const bucketName = process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_REGION || "ap-south-1";
    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  } else {
    const port = process.env.PORT || 5000;
    return `http://localhost:${port}/uploads/${key}`;
  }
}

/**
 * Generates a presigned GET URL for an S3 object (valid for 1 hour).
 * Falls back to the original URL if S3 is not configured or if the URL is local.
 * @param {string} fileUrl - Raw file URL
 * @returns {Promise<string>} Presigned URL or original local URL
 */
async function getPresignedUrl(fileUrl) {
  if (!isS3Configured) {
    return fileUrl;
  }

  try {
    const bucketName = process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_NAME;

    // Parse key from the S3 URL
    const url = new URL(fileUrl);
    
    // Check if the URL is indeed an S3 URL
    const isS3Url = url.hostname.includes("s3.amazonaws.com") || (url.hostname.includes(".s3.") && url.hostname.includes("amazonaws.com"));
    
    if (!isS3Url) {
      // Local or other storage provider URL, return as-is
      return fileUrl;
    }

    // Extract the S3 key from the pathname (remove leading slash)
    const key = decodeURIComponent(url.pathname.substring(1));

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    // Generate presigned URL valid for 3600 seconds (1 hour)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error("Error generating S3 presigned URL:", error.message);
    return fileUrl; // fallback to original URL
  }
}

module.exports = {
  uploadFile,
  deleteFile,
  getFileUrl,
  getPresignedUrl,
};
