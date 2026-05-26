const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const qrcodeService = require("../services/qrcode.service");
const qrService = require("../services/qr.service");

// Register a shopkeeper
exports.register = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!email || !phone || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // Check for existing shopkeeper
    const existing = await prisma.shopkeeper.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(400).json({ message: "Shopkeeper already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique shopSlug
    const slugBase = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const shopSlug = `${slugBase}-${Math.floor(Math.random() * 10000)}`;

    // Create shopkeeper
    const shopkeeper = await prisma.shopkeeper.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        shopName: "My Printing Shop", // Default until onboarding
        shopSlug,
        shopkeeperIdCode: shopSlug,
      },
    });

    // Generate QR Code files
    let qrCode = null;
    let qrCodeUrl = null;
    let qrValue = null;
    try {
      const qrResultLegacy = await qrcodeService.generateShopkeeperQRCode(shopkeeper.id, shopSlug);
      qrCode = qrResultLegacy.qrCode;

      const qrResult = await qrService.generateShopQr(shopkeeper.id);
      qrCodeUrl = qrResult.qrCodeUrl;
      qrValue = qrResult.qrValue;

      // Update shopkeeper with QR details
      await prisma.shopkeeper.update({
        where: { id: shopkeeper.id },
        data: { 
          qrCode, 
          qrCodeUrl, 
          qrValue,
          qrGeneratedAt: new Date()
        },
      });
    } catch (qrErr) {
      console.error("QR Code generation failed during registration:", qrErr);
    }

    // Create token
    const token = jwt.sign(
      { shopkeeper: { id: shopkeeper.id } },
      process.env.JWT_SECRET || "supersecretjwtkeychangeinproduction",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      shopkeeper: {
        id: shopkeeper.id,
        email: shopkeeper.email,
        phone: shopkeeper.phone,
        shopName: shopkeeper.shopName,
        shopSlug,
        qrCodeUrl,
        shopkeeperIdCode: shopkeeper.shopkeeperIdCode,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// Login a shopkeeper
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // Check for shopkeeper
    const shopkeeper = await prisma.shopkeeper.findUnique({
      where: { email },
    });

    if (!shopkeeper) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, shopkeeper.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign(
      { shopkeeper: { id: shopkeeper.id } },
      process.env.JWT_SECRET || "supersecretjwtkeychangeinproduction",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      shopkeeper: {
        id: shopkeeper.id,
        email: shopkeeper.email,
        phone: shopkeeper.phone,
        shopName: shopkeeper.shopName,
        ownerName: shopkeeper.ownerName,
        address: shopkeeper.address,
        category: shopkeeper.category,
        subCategory: shopkeeper.subCategory,
        languagePref: shopkeeper.languagePref,
        gstNumber: shopkeeper.gstNumber,
        socials: shopkeeper.socials,
        pricing: shopkeeper.pricing,
        logoUrl: shopkeeper.logoUrl,
        shopSlug: shopkeeper.shopSlug,
        qrCodeUrl: shopkeeper.qrCodeUrl,
        shopkeeperIdCode: shopkeeper.shopkeeperIdCode,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Get current shopkeeper profile
exports.getProfile = async (req, res) => {
  try {
    const shopkeeper = await prisma.shopkeeper.findUnique({
      where: { id: req.shopkeeper.id },
      select: {
        id: true,
        email: true,
        phone: true,
        shopName: true,
        ownerName: true,
        address: true,
        category: true,
        subCategory: true,
        languagePref: true,
        gstNumber: true,
        socials: true,
        pricing: true,
        logoUrl: true,
        shopkeeperIdCode: true,
      },
    });

    if (!shopkeeper) {
      return res.status(404).json({ message: "Shopkeeper not found" });
    }

    res.json(shopkeeper);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

// Update shopkeeper profile & onboarding data
exports.updateProfile = async (req, res) => {
  try {
    const {
      shopName,
      ownerName,
      address,
      category,
      subCategory,
      languagePref,
      gstNumber,
      socials,
      pricing,
      logoUrl,
      phone,
    } = req.body;

    let updated = await prisma.shopkeeper.update({
      where: { id: req.shopkeeper.id },
      data: {
        shopName: shopName || undefined,
        ownerName: ownerName || null,
        address: address || null,
        category: category || undefined,
        subCategory: subCategory || undefined,
        languagePref: languagePref || undefined,
        gstNumber: gstNumber || null,
        socials: socials || undefined,
        pricing: pricing || undefined,
        logoUrl: logoUrl || null,
        phone: phone || undefined,
      },
    });

    // Generate QR if missing or on onboarding completion
    if (!updated.qrValue || !updated.qrCodeUrl) {
      try {
        const qrResult = await qrService.generateShopQr(updated.id);
        const nextUpdated = await prisma.shopkeeper.update({
          where: { id: updated.id },
          data: {
            qrCodeUrl: qrResult.qrCodeUrl,
            qrValue: qrResult.qrValue,
            qrGeneratedAt: new Date(),
          }
        });
        updated.qrCodeUrl = nextUpdated.qrCodeUrl;
        updated.qrValue = nextUpdated.qrValue;
      } catch (qrErr) {
        console.error("Failed to auto-generate QR during profile update:", qrErr);
      }
    }

    res.json({
      message: "Profile updated successfully",
      shopkeeper: {
        id: updated.id,
        email: updated.email,
        phone: updated.phone,
        shopName: updated.shopName,
        ownerName: updated.ownerName,
        address: updated.address,
        category: updated.category,
        subCategory: updated.subCategory,
        languagePref: updated.languagePref,
        gstNumber: updated.gstNumber,
        socials: updated.socials,
        pricing: updated.pricing,
        logoUrl: updated.logoUrl,
        shopSlug: updated.shopSlug,
        qrCodeUrl: updated.qrCodeUrl,
        shopkeeperIdCode: updated.shopkeeperIdCode,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating profile" });
  }
};

// Get shopkeeper details by slug (Public Customer Flow)
exports.getShopkeeperBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    let shopkeeper = null;
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slug);

    const selectFields = {
      id: true,
      shopName: true,
      ownerName: true,
      address: true,
      phone: true,
      category: true,
      subCategory: true,
      languagePref: true,
      logoUrl: true,
      qrCodeUrl: true,
      pricing: true,
      shopSlug: true,
      shopkeeperIdCode: true,
    };

    if (isUuid) {
      shopkeeper = await prisma.shopkeeper.findUnique({
        where: { id: slug },
        select: selectFields,
      });
    } else {
      shopkeeper = await prisma.shopkeeper.findFirst({
        where: {
          OR: [
            { shopSlug: { equals: slug, mode: 'insensitive' } },
            { shopkeeperIdCode: { equals: slug, mode: 'insensitive' } }
          ]
        },
        select: selectFields,
      });
    }

    if (!shopkeeper) {
      return res.status(404).json({ message: "Shop not found" });
    }

    res.json({ shopkeeper });
  } catch (err) {
    console.error("Get shopkeeper by slug error:", err);
    res.status(500).json({ message: "Server error fetching shop details" });
  }
};

// Get logged-in shopkeeper's QR details
exports.getMeQr = async (req, res) => {
  try {
    let shopkeeper = await prisma.shopkeeper.findUnique({
      where: { id: req.shopkeeper.id },
      select: {
        id: true,
        shopSlug: true,
        qrCodeUrl: true,
        qrValue: true,
      }
    });

    if (!shopkeeper) {
      return res.status(404).json({ message: "Shopkeeper not found" });
    }

    // Auto-generate if missing
    if (!shopkeeper.qrCodeUrl || !shopkeeper.qrValue) {
      try {
        const qrResult = await qrService.generateShopQr(shopkeeper.id);
        const updated = await prisma.shopkeeper.update({
          where: { id: shopkeeper.id },
          data: {
            qrCodeUrl: qrResult.qrCodeUrl,
            qrValue: qrResult.qrValue,
            qrGeneratedAt: new Date(),
          },
          select: {
            id: true,
            shopSlug: true,
            qrCodeUrl: true,
            qrValue: true,
          }
        });
        shopkeeper = updated;
      } catch (qrErr) {
        console.error("Failed to auto-generate missing QR in getMeQr:", qrErr);
      }
    }

    res.json({
      shopId: shopkeeper.id,
      slug: shopkeeper.shopSlug,
      qrCodeUrl: shopkeeper.qrCodeUrl,
      qrValue: shopkeeper.qrValue,
    });
  } catch (err) {
    console.error("Get me QR error:", err);
    res.status(500).json({ message: "Server error fetching QR details" });
  }
};

// Regenerate shopkeeper's QR details
exports.regenerateQr = async (req, res) => {
  try {
    const shopkeeper = await prisma.shopkeeper.findUnique({
      where: { id: req.shopkeeper.id }
    });

    if (!shopkeeper) {
      return res.status(404).json({ message: "Shopkeeper not found" });
    }

    const qrResult = await qrService.generateShopQr(shopkeeper.id);

    const updated = await prisma.shopkeeper.update({
      where: { id: shopkeeper.id },
      data: {
        qrCodeUrl: qrResult.qrCodeUrl,
        qrValue: qrResult.qrValue,
        qrGeneratedAt: new Date(),
      },
      select: {
        id: true,
        shopSlug: true,
        qrCodeUrl: true,
        qrValue: true,
      }
    });

    res.json({
      message: "QR code regenerated successfully",
      shopId: updated.id,
      slug: updated.shopSlug,
      qrCodeUrl: updated.qrCodeUrl,
      qrValue: updated.qrValue,
    });
  } catch (err) {
    console.error("Regenerate QR error:", err);
    res.status(500).json({ message: "Server error regenerating QR details" });
  }
};


