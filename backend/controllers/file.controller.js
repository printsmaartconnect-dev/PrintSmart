const storageService = require("../services/storage.service");
const path = require("path");

// Allowed file types configuration
const ALLOWED_EXTENSIONS = [
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", 
  ".ppt", ".pptx", ".odt", ".odp", ".ods", ".rtf",
  ".jpg", ".jpeg", ".png", ".webp", ".txt", ".csv"
];
const ALLOWED_MIMETYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.presentation",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/rtf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
  "text/csv"
];

// Rejected executable extensions (additional safety)
const REJECTED_EXTENSIONS = [".exe", ".bat", ".apk", ".sh", ".cmd", ".com", ".bin", ".scr"];

exports.upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Fetch allowed extensions from settings
    let allowedExtensions = ALLOWED_EXTENSIONS;
    try {
      const prisma = require("../config/db");
      const settings = await prisma.systemSettings.findUnique({ where: { key: 'allowedFileFormats' } });
      if (settings && settings.value) {
        allowedExtensions = settings.value.split(',').map(ext => ext.trim().toLowerCase());
      }
    } catch (e) {
      console.error("Failed to load allowed extensions, using default:", e);
    }

    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const mimeType = req.file.mimetype;

    // 1. Safety validation: reject explicitly blacklisted executable extensions
    if (REJECTED_EXTENSIONS.includes(fileExtension)) {
      return res.status(400).json({
        message: "Upload rejected: Executable files are not allowed for security reasons."
      });
    }

    // 2. Allowed file types validation
    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({
        message: `Invalid file type. Allowed formats: ${allowedExtensions.join(", ").toUpperCase()}`
      });
    }

    // 3. File size safety check (1GB fallback limit in case it bypasses multer limits)
    const sizeLimit = parseInt(process.env.FILE_SIZE_LIMIT || 1024 * 1024 * 1024, 10);
    if (req.file.size > sizeLimit) {
      return res.status(400).json({
        message: `File size exceeds the allowed limit of ${sizeLimit / (1024 * 1024)}MB.`
      });
    }

    const type = req.body.type || req.query.type;
    const params = {
      shopId: req.body.shopId || req.query.shopId,
      userId: req.body.userId || req.query.userId,
      orderId: req.body.orderId || req.query.orderId,
      invoiceId: req.body.invoiceId || req.query.invoiceId,
      campaignId: req.body.campaignId || req.query.campaignId
    };

    // 4. Upload via Storage Service (automatically handles S3 upload with local fallback)
    const uploadResult = await storageService.upload(req.file, type, params);

    // 5. Build standard response payload maintaining full backward compatibility
    res.status(200).json({
      message: "File uploaded successfully",
      fileName: req.file.originalname,
      fileUrl: uploadResult.fileUrl,
      fileKey: uploadResult.key, // maintains compatibility with endpoints expecting fileKey
      storageType: uploadResult.storageType,
      sizeBytes: req.file.size,
      mimeType: req.file.mimetype
    });

  } catch (err) {
    console.error("File upload controller error:", err);
    res.status(500).json({ message: "Error uploading file to storage" });
  }
};

exports.getPresignedUrl = async (req, res) => {
  try {
    const { fileUrl, filename } = req.query;
    if (!fileUrl) {
      return res.status(400).json({ message: "Missing fileUrl parameter" });
    }

    const presignedUrl = await storageService.generateSignedUrl(fileUrl, filename);
    return res.status(200).json({ presignedUrl });
  } catch (err) {
    console.error("Error generating presigned URL controller:", err);
    return res.status(500).json({ message: "Error generating preview URL" });
  }
};
