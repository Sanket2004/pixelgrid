const express = require("express");
const { getWallpapers } = require("../controllers/userController");

const router = express.Router();
router.get("/wallpapers", getWallpapers);

module.exports = router;