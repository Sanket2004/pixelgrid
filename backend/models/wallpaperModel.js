const mongoose = require("mongoose");

const wallpaperSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    downloads: { type: Number, default: 0 },
    visibility: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Wallpaper", wallpaperSchema);
