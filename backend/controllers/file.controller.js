const storageService = require("../services/storage.service");
const path = require("path");

// Allowed file types configuration
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
const ALLOWED_MIMETYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png"
];

// Rejected executable extensions (additional safety)
const REJECTED_EXTENSIONS = [".exe", ".bat", ".apk", ".sh", ".cmd", ".com", ".bin", ".scr"];

exports.upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
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
    if (!ALLOWED_EXTENSIONS.includes(fileExtension) || !ALLOWED_MIMETYPES.includes(mimeType)) {
      return res.status(400).json({
        message: `Invalid file type. Allowed formats: ${ALLOWED_EXTENSIONS.join(", ").toUpperCase()}`
      });
    }

    // 3. File size safety check (50MB fallback limit in case it bypasses multer limits)
    const sizeLimit = parseInt(process.env.FILE_SIZE_LIMIT || 50 * 1024 * 1024, 10);
    if (req.file.size > sizeLimit) {
      return res.status(400).json({
        message: `File size exceeds the limit of ${(sizeLimit / (1024 * 1024)).toFixed(0)}MB.`
      });
    }

    // 4. Upload via Storage Service (automatically handles S3 upload with local fallback)
    const uploadResult = await storageService.uploadFile(req.file);

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
