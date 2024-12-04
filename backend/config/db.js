const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("DB CONNECTED");
  } catch (error) {
    console.error("DB CONNECTION FAILED ", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
