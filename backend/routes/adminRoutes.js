const express = require("express");
const {
  login,
  uploadWallpaper,
  getWallpapers,
  signup,
  getUserDetails,
  updateWallpaper,
  deleteWallpaper,
  updateVisibility,
  logout,
} = require("../controllers/adminController");
const authMiddleware = require("../config/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/upload", authMiddleware, uploadWallpaper);
router.get("/wallpapers", authMiddleware, getWallpapers);
router.get("/details", authMiddleware, getUserDetails);
router.put("/wallpaper/:id", authMiddleware, updateWallpaper);
router.delete("/wallpaper/:id", authMiddleware, deleteWallpaper);
router.put('/wallpaper/:id/visibility',authMiddleware, updateVisibility);

router.post("/logout", logout);

module.exports = router;
