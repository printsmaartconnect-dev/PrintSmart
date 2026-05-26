const storageService = require("../services/storage.service");

exports.upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadResult = await storageService.uploadFile(req.file);

    res.status(200).json({
      message: "File uploaded successfully",
      fileName: req.file.originalname,
      fileUrl: uploadResult.url,
      fileKey: uploadResult.key,
      sizeBytes: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (err) {
    console.error("File upload controller error:", err);
    res.status(500).json({ message: "Error uploading file to storage" });
  }
};
