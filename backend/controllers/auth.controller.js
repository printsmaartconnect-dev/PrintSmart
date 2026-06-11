const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const qrcodeService = require("../services/qrcode.service");
const qrService = require("../services/qr.service");
const sessionService = require("../services/session.service");

const jwtSecret = process.env.JWT_SECRET || "supersecretjwtkeychangeinproduction";

async function generateUniqueShopkeeperId() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  while (true) {
    const x1 = Math.floor(Math.random() * 10);
    const a = alphabet[Math.floor(Math.random() * alphabet.length)];
    const x2 = Math.floor(Math.random() * 10);
    const x3 = Math.floor(Math.random() * 10);
    const x4 = Math.floor(Math.random() * 10);
    const x5 = Math.floor(Math.random() * 10);
    const code = `${x1}${a}-${x2}${x3}${x4}${x5}`;

    const existing = await prisma.shopkeeper.findFirst({
      where: {
        OR: [
          { shopSlug: code },
          { shopkeeperIdCode: code }
        ]
      }
    });

    if (!existing) {
      return code;
    }
  }
}


function createAuthResponse(shopkeeper, token) {
  return {
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
      businessDescription: shopkeeper.businessDescription,
      businessEstablishedYear: shopkeeper.businessEstablishedYear,
      website: shopkeeper.website,
      alternatePhone: shopkeeper.alternatePhone,
      socials: shopkeeper.socials,
      pricing: shopkeeper.pricing,
      logoUrl: shopkeeper.logoUrl,
      shopSlug: shopkeeper.shopSlug,
      qrCodeUrl: shopkeeper.qrCodeUrl,
      shopkeeperIdCode: shopkeeper.shopkeeperIdCode,
      upiId: shopkeeper.upiId,
      paymentQrUrl: shopkeeper.paymentQrUrl,
      isOnboarded: shopkeeper.isOnboarded,
      profileCompleted: shopkeeper.profileCompleted,
      pricingCompleted: shopkeeper.pricingCompleted,
      createdAt: shopkeeper.createdAt,
    },
  };
}

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

    // Generate unique shopSlug in xA-xxxx format
    const shopSlug = await generateUniqueShopkeeperId();

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

      const qrResult = await qrService.generateShopQr(shopkeeper.id, shopSlug);
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
      jwtSecret,
      { expiresIn: "7d" }
    );

    // Register session with session manager
    await sessionService.registerSession(shopkeeper.id, token);

    const returnedShopkeeper = await prisma.shopkeeper.findUnique({
      where: { id: shopkeeper.id },
    });

    res.status(201).json(createAuthResponse(returnedShopkeeper, token));
  } catch (err) {
    console.error(err);
    try {
      require("fs").writeFileSync(
        require("path").join(__dirname, "../registration-error.log"),
        `Error: ${err.message}\nStack: ${err.stack}\nTime: ${new Date().toISOString()}\n\n`
      );
    } catch (fsErr) {
      console.error("Failed to write registration error to file:", fsErr);
    }
    res.status(500).json({ message: `Server error during registration: ${err.message}` });
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

    const token = jwt.sign(
      { shopkeeper: { id: shopkeeper.id } },
      jwtSecret,
      { expiresIn: "7d" }
    );

    // Register session with session manager
    await sessionService.registerSession(shopkeeper.id, token);

    res.json(createAuthResponse(shopkeeper, token));
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
        businessDescription: true,
        businessEstablishedYear: true,
        website: true,
        alternatePhone: true,
        socials: true,
        pricing: true,
        logoUrl: true,
        shopSlug: true,
        qrCodeUrl: true,
        shopkeeperIdCode: true,
        upiId: true,
        paymentQrUrl: true,
        isOnboarded: true,
        profileCompleted: true,
        pricingCompleted: true,
        createdAt: true,
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

// Handle Google OAuth sign-in/up for shopkeeper
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Missing Google credential" });
    }

    if (typeof fetch !== "function") {
      return res.status(500).json({ message: "Server fetch is unavailable" });
    }

    const tokenInfoRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );

    if (!tokenInfoRes.ok) {
      return res.status(401).json({ message: "Invalid Google credential" });
    }

    const tokenInfo = await tokenInfoRes.json();
    const email = tokenInfo.email;
    const name = tokenInfo.name || tokenInfo.email?.split("@")[0];
    const phone = tokenInfo.phone_number || "";

    // Verify audience to make sure it was issued for this application
    if (tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
      console.warn(`Audience mismatch: token aud is ${tokenInfo.aud}, expected ${process.env.GOOGLE_CLIENT_ID}`);
      return res.status(401).json({ message: "Google token was not issued for this application" });
    }

    if (!email) {
      return res.status(400).json({ message: "Google token did not return an email" });
    }

    let shopkeeper = await prisma.shopkeeper.findUnique({ where: { email } });
    if (!shopkeeper) {
      const shopSlug = await generateUniqueShopkeeperId();

      // Generate a secure, random dummy password to satisfy DB schema requirements
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      shopkeeper = await prisma.shopkeeper.create({
        data: {
          email,
          phone: phone || "0000000000",
          password: hashedPassword,
          shopName: "My Printing Shop",
          shopSlug,
          shopkeeperIdCode: shopSlug,
          ownerName: name,
        },
      });

      // Generate QR Code for the new Google OAuth registered shopkeeper
      try {
        const qrResult = await qrService.generateShopQr(shopkeeper.id, shopSlug);
        const updated = await prisma.shopkeeper.update({
          where: { id: shopkeeper.id },
          data: {
            qrCodeUrl: qrResult.qrCodeUrl,
            qrValue: qrResult.qrValue,
            qrGeneratedAt: new Date(),
          },
        });
        shopkeeper = updated;
      } catch (qrErr) {
        console.error("QR Code generation failed during Google registration:", qrErr);
      }
    }

    const token = jwt.sign({ shopkeeper: { id: shopkeeper.id } }, jwtSecret, {
      expiresIn: "7d",
    });

    // Register session with session manager
    await sessionService.registerSession(shopkeeper.id, token);

    res.json(createAuthResponse(shopkeeper, token));
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ 
      message: "Server error during Google auth",
      error: err.message,
      stack: err.stack
    });
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
      businessDescription,
      businessEstablishedYear,
      website,
      alternatePhone,
      socials,
      pricing,
      logoUrl,
      phone,
      upiId,
      paymentQrUrl,
    } = req.body;

    const profileCompleted = Boolean(
      shopName &&
      languagePref &&
      businessDescription &&
      address &&
      phone &&
      upiId
    );
    const pricingCompleted = Boolean(pricing && Object.keys(pricing).length > 0);
    const isOnboarded = profileCompleted && pricingCompleted;

    const estYear = businessEstablishedYear ? parseInt(businessEstablishedYear, 10) : null;

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
        businessDescription: businessDescription || null,
        businessEstablishedYear: isNaN(estYear) ? null : estYear,
        website: website || null,
        alternatePhone: alternatePhone || null,
        socials: socials || undefined,
        pricing: pricing || undefined,
        logoUrl: logoUrl || null,
        phone: phone || undefined,
        upiId: upiId !== undefined ? upiId : undefined,
        paymentQrUrl: paymentQrUrl !== undefined ? paymentQrUrl : undefined,
        profileCompleted,
        pricingCompleted,
        isOnboarded,
      },
    });

    // Generate QR if missing or on onboarding completion
    if (!updated.qrValue || !updated.qrCodeUrl) {
      try {
        const qrResult = await qrService.generateShopQr(updated.id, updated.shopSlug);
        const nextUpdated = await prisma.shopkeeper.update({
          where: { id: updated.id },
          data: {
            qrCodeUrl: qrResult.qrCodeUrl,
            qrValue: qrResult.qrValue,
            qrGeneratedAt: new Date(),
          },
        });
        updated.qrCodeUrl = nextUpdated.qrCodeUrl;
        updated.qrValue = nextUpdated.qrValue;
      } catch (qrErr) {
        console.error("Failed to auto-generate QR during profile update:", qrErr);
      }
    }

    res.json({
      message: "Profile updated successfully",
      shopkeeper: createAuthResponse(updated, null).shopkeeper,
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
      upiId: true,
      paymentQrUrl: true,
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
        const qrResult = await qrService.generateShopQr(shopkeeper.id, shopkeeper.shopSlug);
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

// Regenerate shopkeeper's QR details - DEPRECATED
exports.regenerateQr = async (req, res) => {
  return res.status(410).json({ message: "Regenerate QR feature has been disabled." });
};


