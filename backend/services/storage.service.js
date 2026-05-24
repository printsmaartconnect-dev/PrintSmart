const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

const isS3Configured = !!(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_S3_BUCKET_NAME
);

let s3Client = null;
if (isS3Configured) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

// Local storage configuration
const localUploadDir = path.resolve(process.env.UPLOAD_DIR || "./uploads");
if (!isS3Configured && !fs.existsSync(localUploadDir)) {
  fs.mkdirSync(localUploadDir, { recursive: true });
}

/**
 * Uploads a file (from multer memoryStorage) to the active storage provider.
 * @param {Express.Multer.File} file 
 * @returns {Promise<{ url: string, key: string }>}
 */
async function uploadFile(file) {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const fileExtension = path.extname(file.originalname);
  const key = `${uniqueSuffix}${fileExtension}`;

  if (isS3Configured) {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);
    const url = `https://${bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
    return { url, key };
  } else {
    const filePath = path.join(localUploadDir, key);
    fs.writeFileSync(filePath, file.buffer);
    
    const port = process.env.PORT || 5000;
    const serverUrl = process.env.FRONTEND_URL ? `http://localhost:${port}` : `http://localhost:${port}`;
    const url = `${serverUrl}/uploads/${key}`;
    return { url, key };
  }
}

/**
 * Deletes a file from the active storage provider.
 * @param {string} key 
 * @returns {Promise<void>}
 */
async function deleteFile(key) {
  if (isS3Configured) {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
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
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
  } else {
    const port = process.env.PORT || 5000;
    return `http://localhost:${port}/uploads/${key}`;
  }
}

module.exports = {
  uploadFile,
  deleteFile,
  getFileUrl,
};
