const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from header
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretjwtkeychangeinproduction");
    req.shopkeeper = decoded.shopkeeper;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
