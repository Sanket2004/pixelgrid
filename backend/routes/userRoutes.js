const express = require("express");
const { getWallpapers, downloadWallpaper, likeWallpaper } = require("../controllers/userController");

const router = express.Router();
router.get("/wallpapers", getWallpapers);
router.get("/wallpaper/:id", downloadWallpaper);
router.get("/wallpaper/:id/like", likeWallpaper);

module.exports = router;