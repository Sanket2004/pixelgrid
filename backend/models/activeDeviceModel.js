const mongoose = require("mongoose");

const ActiveDeviceModel = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    deviceInfo: { type: String, required: true },
    ip: { type: String, required: true },
    lastSeen: { type: Date, default: Date.now },
    tokenSessionId: { type: String, required: true },
  }
);

module.exports = mongoose.model("ActiveDevice", ActiveDeviceModel);
