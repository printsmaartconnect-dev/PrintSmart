const jwt = require("jsonwebtoken");
const sessionService = require("../services/session.service");

module.exports = function (req, res, next) {
  // Get token from header
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretjwtkeychangeinproduction");
    
    // Enforce concurrent login limit for shopkeeper
    if (decoded.shopkeeper && decoded.shopkeeper.id) {
      if (!sessionService.isSessionActive(decoded.shopkeeper.id, token)) {
        return res.status(401).json({ 
          message: "Session limit exceeded. You have been logged out because you logged in on another device." 
        });
      }
    }

    req.shopkeeper = decoded.shopkeeper;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
