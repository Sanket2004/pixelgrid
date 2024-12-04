const Wallpaper = require("../models/wallpaperModel");

exports.getWallpapers = async (req, res) => {
  const wallpaper = await Wallpaper.find();
  res.json(wallpaper);
};
