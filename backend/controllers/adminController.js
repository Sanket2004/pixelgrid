const Wallpaper = require("../models/wallpaperModel");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier"); // To stream the image to Cloudinary
const ActiveDeviceModel = require("../models/activeDeviceModel");

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

  if (!email && !password) {
    return res
      .status(400)
      .json({ message: "Please enter both email and password" });
  }
  try {
    const user = await User.findOne({ email, role: "admin" });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const existingDevice = await ActiveDeviceModel.findOne({
      userId: user._id,
    });
    console.log(user._id);

    if (existingDevice) {
      return res.status(403).json({
        message:
          "You are already logged in on another device. Please log out from the other device first.",
      });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const userAgent = req.headers["user-agent"];
    const ip = req.ip;
    await ActiveDeviceModel.create({
      userId: user._id,
      deviceInfo: userAgent,
      ip,
      lastSeen: new Date(),
      tokenSessionId: token,
    });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error on Admin Login" });
  }
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

// UPLOAD WALLPAPER
exports.uploadWallpaper = [
  upload.single("image"),
  async (req, res) => {
    const { title, description, category, tags } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    // Validate required fields
    if (!title || !description || !category) {
      return res
        .status(400)
        .json({ message: "Title, description, and category are required" });
    }

    try {
      // Upload the file to Cloudinary
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

          // Extract Cloudinary response data
          const imageUrl = result.secure_url;
          const resolution = `${result.width}x${result.height}`;
          const fileSize = Math.round(result.bytes / 1024); // Convert bytes to KB

          // Create a new wallpaper document
          const wallpaper = new Wallpaper({
            title,
            description,
            imageUrl,
            visibility: true,
            category,
            tags: tags ? tags.split(",").map((tag) => tag.trim()) : [], // Split tags by comma
            resolution,
            fileSize,
            uploaderId: req.user._id, // Assumes `req.user` contains the authenticated user's ID
          });

          await wallpaper.save();

          res.status(201).json({
            message: "Wallpaper uploaded successfully",
            wallpaper,
          });
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
            { width: 600, crop: "scale" }, // Resize to a smaller width
            { quality: "50" }, // Reduce quality
            { fetch_format: "auto" }, // Optimize format
            {
              overlay: "lp12jta7i7klxaad4rbv",
              gravity: "north_east",
              x: 10,
              y: 10,
              width: 80,
              opacity: 90,
            },
          ],
        }
      );

      // console.log(cloudinaryUrl);

      const { imageUrl, ...wallData } = wall.toObject();

      return {
        ...wallData,
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

exports.updateWallpaper = async (req, res) => {
  const { id } = req.params;
  const { title, description, tags, category } = req.body;

  try {
    // Check required fields
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    // Update wallpaper
    const updateWallpaper = await Wallpaper.findByIdAndUpdate(
      id,
      { title, description, tags, category },
      { new: true, runValidators: true } // Ensure validators are run and return the updated document
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

// exports.logout = async (req, res) => {
//   try {
//     // Remove the active device session for the logged-in user
//     await ActiveDeviceModel.deleteOne({
//       userId: req.user._id,
//       tokenSessionId: req.headers.authorization?.split(" ")[1], // Make sure the session is invalidated
//     });

//     return res.status(201).json({ message: "Logged out successfully." });
//   } catch (error) {
//     console.error("Logout error:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

exports.logout = async (req, res) => {
  try {
    const { token } = req.body; // Extract the token from the body
    console.log("Received token:", token);

    if (!token) {
      return res.status(400).json({ message: "Authorization token is required." });
    }

    // Decode the token to get user ID (even if expired)
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        ignoreExpiration: true,
      });
      userId = decoded._id;
    } catch (error) {
      console.warn("Token expired, but proceeding with logout.");
      const decoded = jwt.decode(token);
      userId = decoded?.id;
    }

    // Remove the session from the database
    await ActiveDeviceModel.deleteOne({ userId, tokenSessionId: token });

    return res.status(204).send(); // No Content
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
