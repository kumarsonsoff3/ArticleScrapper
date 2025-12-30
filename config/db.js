const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`✅ Connected to MongoDB!`);
  } catch (err) {
    console.error(`DB Connection Error: `, err);
    process.exit(1);
  }
};

module.exports = connectDB;
