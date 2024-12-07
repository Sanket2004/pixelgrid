const jwt = require("jsonwebtoken");
const ActiveDeviceModel = require("../models/ActiveDeviceModel");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    const userAgent = req.headers["user-agent"];
    const activeDevice = await ActiveDeviceModel.findOneAndUpdate({
      userId: decoded._id,
      deviceInfo: userAgent,
      tokenSessionId: token,
      lastSeen: new Date(),
    });

    if (!activeDevice)
      return res
        .status(401)
        .json({ message: "Session invalid or expired. Please log in again." });

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
