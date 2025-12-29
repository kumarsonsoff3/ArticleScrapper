const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,
  link: {
    type: String,
    unique: true,
  },
});

module.exports = mongoose.model("Article", articleSchema);
