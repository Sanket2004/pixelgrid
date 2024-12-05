const Wallpaper = require("../models/wallpaperModel");
const cloudinary = require("cloudinary");

// GET WALLPAPERS (with visibility check)
exports.getWallpapers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find wallpapers with visibility true
    const wallpapers = await Wallpaper.find({ visibility: true })
      .skip(skip)
      .limit(limit);

    // Total visible wallpapers for pagination
    const total = await Wallpaper.countDocuments({ visibility: true });

    const compressedWalls = wallpapers.map((wall) => {
      // Extract image path from the full imageUrl (everything after /upload/)
      const imagePath = wall.imageUrl.split("/upload/")[1]; // This will get the path after /upload/

      // Generate the Cloudinary URL for the image transformation
      const cloudinaryUrl = cloudinary.url(imagePath, {
        transformation: [
          { crop: "scale" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      });

      return {
        ...wall.toObject(),
        compressedUrl: cloudinaryUrl,
      };
    });

    res.json({
      wallpapers: compressedWalls,
      total,
      page,
      totalPage: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching wallpapers:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// DOWNLOAD WALLPAPER (with visibility check and download count increment)
exports.downloadWallpaper = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the wallpaper by ID
    const wallpaper = await Wallpaper.findById(id);

    // Check if the wallpaper exists and is visible
    if (!wallpaper) {
      return res.status(404).json({ message: "Wallpaper not found" });
    }

    if (!wallpaper.visibility) {
      return res.status(403).json({ message: "Wallpaper is not visible" });
    }

    // Increase the download count
    wallpaper.downloads += 1;
    await wallpaper.save();

    // Send the imageUrl as the response
    res.json({
      imageUrl: wallpaper.imageUrl,
      downloads: wallpaper.downloads,
    });
  } catch (error) {
    console.error("Error downloading wallpaper:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
