const mongoose = require("mongoose");

const wallpaperSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true }, // Trim to remove extra spaces
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    downloads: { type: Number, default: 0 },
    visibility: { type: Boolean, default: true },
    category: { type: String, required: true }, // E.g., "Nature", "Abstract", "Technology"
    tags: { type: [String], default: [] }, // For easy searching and filtering
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Links to the admin or user who uploaded it
    resolution: { type: String, default: "1920x1080" }, // Resolution of the image
    fileSize: { type: Number, default: 0 }, // Size of the image file in KB or MB
    likes: { type: Number, default: 0 }, // Number of likes for the wallpaper
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

module.exports = mongoose.model("Wallpaper", wallpaperSchema);
