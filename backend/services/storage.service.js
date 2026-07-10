const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, CopyObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
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

/**
 * Reusable helper to upload a buffer to S3.
 * @param {string} bucket - The S3 bucket name
 * @param {string} folder - The S3 folder/prefix path
 * @param {string} filename - The target filename
 * @param {Buffer} buffer - File buffer content
 * @param {string} contentType - File mime type
 * @returns {Promise<{ url: string, key: string }>}
 */
async function uploadToS3(bucket, folder, filename, buffer, contentType) {
  if (!s3Client) {
    throw new Error("S3 Client is not initialized.");
  }
  const cleanFolder = folder ? folder.replace(/\/$/, "") : "";
  const key = cleanFolder ? `${cleanFolder}/${filename}` : filename;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  const region = process.env.AWS_REGION || "ap-south-1";
  const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  return { url, key };
}

/**
 * Helper to save a file locally matching the S3 prefix layout.
 * @param {string} folder 
 * @param {string} filename 
 * @param {Buffer} buffer 
 * @returns {{ url: string, key: string }}
 */
function saveToLocal(folder, filename, buffer) {
  const cleanFolder = folder ? folder.replace(/\/$/, "") : "";
  const targetDir = path.join(localUploadDir, cleanFolder);
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetPath = path.join(targetDir, filename);
  fs.writeFileSync(targetPath, buffer);

  const key = cleanFolder ? `${cleanFolder}/${filename}` : filename;
  const port = process.env.PORT || 5000;
  const url = `http://localhost:${port}/uploads/${key}`;

  return { url, key };
}

/**
 * Uploads a file (from multer memoryStorage) to S3 with structured paths, or falls back to local storage.
 * 
 * Folder layouts:
 * - Customer uploaded documents (temporary): uploads/temporary/{uuidFilename}
 * - Customer uploaded documents (permanent order): uploads/customer-orders/{orderId}/{filename}
 * - Shop Logo: shop-logos/{shopId}.png
 * - User Avatar: user-avatars/{userId}.jpg
 * - Generated Invoice: generated-invoices/{invoiceId}.pdf
 * - QR Poster: qr-posters/{shopId}.pdf
 * - Marketing Images: marketing/{campaignId}/{filename}
 * - AI Generated Images: ai-images/{shopId}/{filename}
 * 
 * @param {Express.Multer.File} file - Multer memory file object
 * @param {string} [type] - Category of upload
 * @param {object} [params] - Dynamic parameters (orderId, shopId, userId, invoiceId, campaignId)
 * @returns {Promise<{ fileUrl: string, storageType: 's3'|'local', key: string }>}
 */
async function uploadFile(file, type, params = {}) {
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const uuidFilename = `${uuidv4()}${fileExtension}`;

  let folder = "uploads/temporary";
  let filename = uuidFilename;

  switch (type) {
    case "customer-order":
      const orderId = params.orderId || "temp";
      folder = `uploads/customer-orders/${orderId}`;
      filename = file.originalname;
      break;
    case "shop-logo":
      folder = "shop-logos";
      filename = params.shopId ? `${params.shopId}.png` : `${uuidv4()}.png`;
      break;
    case "user-avatar":
      folder = "user-avatars";
      filename = params.userId ? `${params.userId}.jpg` : `${uuidv4()}.jpg`;
      break;
    case "generated-invoice":
      folder = "generated-invoices";
      filename = params.invoiceId ? `${params.invoiceId}.pdf` : `${uuidv4()}.pdf`;
      break;
    case "qr-poster":
      folder = "qr-posters";
      filename = params.shopId ? `${params.shopId}.pdf` : `${uuidv4()}.pdf`;
      break;
    case "marketing":
      const campaignId = params.campaignId || "default";
      folder = `marketing/${campaignId}`;
      filename = file.originalname;
      break;
    case "ai-image":
      const shopId = params.shopId || "default";
      folder = `ai-images/${shopId}`;
      filename = file.originalname;
      break;
    default:
      if (params.orderId) {
        folder = `uploads/customer-orders/${params.orderId}`;
        filename = file.originalname;
      } else {
        folder = "uploads/temporary";
        filename = uuidFilename;
      }
      break;
  }

  if (isS3Configured) {
    try {
      const bucketName = process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_NAME;
      const result = await uploadToS3(bucketName, folder, filename, file.buffer, file.mimetype);
      console.log(`[S3] Upload success under folder: ${folder}`);
      return {
        fileUrl: result.url,
        storageType: "s3",
        key: result.key,
      };
    } catch (s3Error) {
      console.error(`[S3] Upload error: ${s3Error.message}. Falling back to local.`);
    }
  }

  // Local fallback flow
  const result = saveToLocal(folder, filename, file.buffer);
  return {
    fileUrl: result.url,
    storageType: "local",
    key: result.key,
  };
}

/**
 * Moves/renames a file from source key to destination key.
 * @param {string} sourceKey 
 * @param {string} destinationKey 
 * @returns {Promise<{ url: string, key: string }>}
 */
async function moveFile(sourceKey, destinationKey) {
  if (isS3Configured) {
    const bucketName = process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_NAME;
    
    // Copy file
    await s3Client.send(new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${sourceKey}`,
      Key: destinationKey,
    }));
    
    // Delete source
    await s3Client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: sourceKey,
    }));
    
    const region = process.env.AWS_REGION || "ap-south-1";
    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${destinationKey}`;
    
    return { url, key: destinationKey };
  } else {
    // Local move
    const srcPath = path.join(localUploadDir, sourceKey);
    const destPath = path.join(localUploadDir, destinationKey);
    const destDir = path.dirname(destPath);
    
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    if (fs.existsSync(srcPath)) {
      fs.renameSync(srcPath, destPath);
    }
    
    const port = process.env.PORT || 5000;
    const url = `http://localhost:${port}/uploads/${destinationKey}`;
    
    return { url, key: destinationKey };
  }
}

/**
 * Deletes a file from S3 or local storage.
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
 * @param {string} fileUrl - Raw file URL
 * @returns {Promise<string>} Presigned URL or original local URL
 */
async function getPresignedUrl(fileUrl, downloadFilename) {
  if (!isS3Configured) {
    return fileUrl;
  }

  try {
    const bucketName = process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_NAME;
    const url = new URL(fileUrl);
    const isS3Url = url.hostname.includes("s3.amazonaws.com") || (url.hostname.includes(".s3.") && url.hostname.includes("amazonaws.com"));
    
    if (!isS3Url) {
      return fileUrl;
    }

    const key = decodeURIComponent(url.pathname.substring(1));

    // Verify S3 file existence first
    try {
      await s3Client.send(new HeadObjectCommand({
        Bucket: bucketName,
        Key: key
      }));
    } catch (headErr) {
      if (headErr.name === 'NotFound' || headErr.$metadata?.httpStatusCode === 404) {
        const fileErr = new Error("S3FileNotFound");
        fileErr.code = "S3FileNotFound";
        throw fileErr;
      }
    }

    const commandParams = {
      Bucket: bucketName,
      Key: key,
    };

    if (downloadFilename) {
      commandParams.ResponseContentDisposition = `attachment; filename="${encodeURIComponent(downloadFilename)}"`;
    }

    const command = new GetObjectCommand(commandParams);
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    if (error.code === "S3FileNotFound") {
      throw error;
    }
    console.error("Error generating S3 presigned URL:", error.message);
    return fileUrl;
  }
}

/**
 * Deletes a complete folder prefix (recursively deletes all objects within the folder).
 * @param {string} folderPath - The folder path/prefix to delete
 * @returns {Promise<void>}
 */
async function deleteFolder(folderPath) {
  if (!folderPath) return;
  const cleanFolder = folderPath.replace(/\/$/, "") + "/";

  if (isS3Configured) {
    try {
      const { ListObjectsV2Command, DeleteObjectsCommand } = require("@aws-sdk/client-s3");
      const bucketName = process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_NAME;

      let continuationToken = undefined;
      let isTruncated = true;

      while (isTruncated) {
        const listCommand = new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: cleanFolder,
          ContinuationToken: continuationToken,
        });

        const data = await s3Client.send(listCommand);
        const contents = data.Contents || [];
        const keysToDelete = contents.map(obj => ({ Key: obj.Key }));

        if (keysToDelete.length > 0) {
          await s3Client.send(new DeleteObjectsCommand({
            Bucket: bucketName,
            Delete: {
              Objects: keysToDelete,
              Quiet: true,
            },
          }));
        }

        isTruncated = data.IsTruncated;
        continuationToken = data.NextContinuationToken;
      }
      console.log(`[S3] Successfully deleted folder prefix: ${cleanFolder}`);
    } catch (err) {
      console.error(`[S3] Error deleting folder prefix ${cleanFolder}:`, err.message);
    }
  } else {
    // Local folder fallback
    try {
      const targetDir = path.join(localUploadDir, cleanFolder);
      if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
        console.log(`[Local] Successfully deleted folder: ${targetDir}`);
      }
    } catch (err) {
      console.error(`[Local] Error deleting folder ${cleanFolder}:`, err.message);
    }
  }
}

module.exports = {
  upload: uploadFile,
  uploadFile,
  uploadToS3,
  moveFile,
  deleteFile,
  deleteFolder,
  getFileUrl,
  getPresignedUrl,
  generateSignedUrl: getPresignedUrl,
  isS3Configured,
};
