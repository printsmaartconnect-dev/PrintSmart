const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

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

    // Create shopkeeper
    const shopkeeper = await prisma.shopkeeper.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        shopName: "My Printing Shop", // Default until onboarding
      },
    });

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

    const updated = await prisma.shopkeeper.update({
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
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating profile" });
  }
};
