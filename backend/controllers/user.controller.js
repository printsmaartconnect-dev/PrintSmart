const prisma = require("../config/db");

// Create or update a customer user
exports.createUser = async (req, res) => {
  try {
    const { name, phone, email, language } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Map language string to Enum Language format
    let languageEnum = "ENGLISH";
    if (language) {
      const upperLang = language.toUpperCase();
      if (["ENGLISH", "HINDI", "MARATHI", "GUJARATI", "OTHER"].includes(upperLang)) {
        languageEnum = upperLang;
      } else {
        languageEnum = "OTHER";
      }
    }

    let user = null;

    // If email is provided, check if user exists
    if (email && email.trim() !== "") {
      user = await prisma.user.findUnique({
        where: { email: email.trim() },
      });

      if (user) {
        // Update existing user details
        user = await prisma.user.update({
          where: { email: email.trim() },
          data: {
            name,
            phone: phone || user.phone,
            language: languageEnum,
          },
        });
        return res.status(200).json({
          message: "User details updated successfully",
          user,
        });
      }
    }

    // If no existing user, create a new one
    // Generate a placeholder email if email is not provided
    const targetEmail = email && email.trim() !== "" 
      ? email.trim() 
      : `anon-${Date.now()}-${Math.floor(Math.random() * 10000)}@printsmart.placeholder`;

    user = await prisma.user.create({
      data: {
        email: targetEmail,
        name,
        phone: phone || null,
        language: languageEnum,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: "Server error creating user", error: err.message });
  }
};

// Get user profile details
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: true,
        feedback: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Server error fetching user", error: err.message });
  }
};
