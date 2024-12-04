const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
// const path = require("path")

dotenv.config();

const app = express();

//DB CONNECTION
connectDB();

//MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

//APP RUN
const PORT = process.env.PORT || 5000;
app.listen(PORT || 5000, () => {
  console.log(`Server is running on port ${PORT}`);
});
