const Wallpaper = require("../models/wallpaperModel");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier"); // To stream the image to Cloudinary

// Configure Cloudinary with your credentials (in a separate config file or .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const upload = multer({ storage });

//ADMIN LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, role: "admin" });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign(
    { _id: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  res.json({ token });
};

// ADMIN SIGNUP
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email, role: "admin" });
  if (existingUser) {
    return res.status(400).json({ message: "Admin user already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    role: "admin",
  });

  await user.save();

  res.status(201).json({ message: "Admin user created successfully" });
};

//USER DETAILS
exports.getUserDetails = async (req, res) => {
  try {
    // Fetch user data using the ID attached to req.user by the authMiddleware
    const user = await User.findById(req.user._id);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with user data (excluding sensitive information)
    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    // Handle errors
    console.error("Error fetching user details:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

//UPLOAD WALLPAPER
exports.uploadWallpaper = [
  upload.single("image"),
  async (req, res) => {
    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    try {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "wallpapers",
        },
        async (error, result) => {
          if (error) {
            console.error("Error uploading to Cloudinary:", error);
            return res
              .status(500)
              .json({ message: "Error uploading to Cloudinary" });
          }

          const imageUrl = result.secure_url;

          const wallpaper = new Wallpaper({
            title,
            description,
            imageUrl,
            visibility: true,
          });

          await wallpaper.save();
          res.json(wallpaper);
        }
      );
      // Stream the file to Cloudinary directly from memory
      streamifier.createReadStream(file.buffer).pipe(stream);
    } catch (error) {
      console.error("Error during wallpaper upload:", error.message);
      res
        .status(500)
        .json({ message: "An error occurred while uploading the wallpaper" });
    }
  },
];

// GET WALLPAPERS
exports.getWallpapers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const wallpapers = await Wallpaper.find().skip(skip).limit(limit);

    // Total walls for pagination
    const total = await Wallpaper.countDocuments();

    const compressedWalls = wallpapers.map((wall) => {
      // Extract image path from the full imageUrl (everything after /upload/)
      const imagePath = wall.imageUrl.split("/upload/")[1]; // This will get the path after /upload/

      // Generate the Cloudinary URL for the image transformation
      const cloudinaryUrl = cloudinary.url(
        imagePath,

        {
          transformation: [
            { width: 1000, crop: "scale" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        }
      );


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

//UPDATE WALLS
exports.updateWallpaper = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }
    const updateWallpaper = await Wallpaper.findByIdAndUpdate(
      id,
      { title, description },
      { new: true, runValidators: true }
    );

    if (!updateWallpaper) {
      return res.status(404).json({ message: "Wallpaper not found" });
    }

    res
      .status(200)
      .json({ message: "Wallpaper updated successfully", updateWallpaper });
  } catch (error) {
    console.error("Error updating wallpaper:", error.message);
    res
      .status(500)
      .json({ message: "An error occurred updating the wallpaper." });
  }
};

//DELETE WALLS
exports.deleteWallpaper = async (req, res) => {
  const { id } = req.params;

  try {
    const wallpaper = await Wallpaper.findByIdAndDelete(id);
    if (!wallpaper) {
      return res.status(404).json({ message: "Wallpaper not found" });
    }

    res.status(200).json({ message: "Wallpaper deleted successfully" });
  } catch (error) {
    console.error("Error deleting wallpaper:", error.message);
    res
      .status(500)
      .json({ message: "An error occurred deleting the wallpaper." });
  }
};

//UPDATE VISIBILITY
exports.updateVisibility = async (req, res) => {
  const { id } = req.params; // Extract the wallpaper ID from the request params

  try {
    // Find the wallpaper by ID
    const wallpaper = await Wallpaper.findById(id);

    if (!wallpaper) {
      return res.status(404).json({ message: "Wallpaper not found" });
    }

    // Toggle the visibility between true/false or 1/0
    wallpaper.visibility = !wallpaper.visibility; // If it's true, it becomes false, if false, becomes true.

    // Save the updated wallpaper
    await wallpaper.save();

    // Return the updated wallpaper
    return res
      .status(200)
      .json({ message: "Visibility updated successfully", wallpaper });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating visibility" });
  }
};
