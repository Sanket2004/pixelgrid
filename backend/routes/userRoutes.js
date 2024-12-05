const express = require("express");
const { getWallpapers, downloadWallpaper } = require("../controllers/userController");

const router = express.Router();
router.get("/wallpapers", getWallpapers);
router.get("/wallpaper/:id", downloadWallpaper);

module.exports = router;