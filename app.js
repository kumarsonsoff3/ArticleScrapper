require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const scrapeAndSeed = require('./utils/scraper');
const enhanceArticles = require('./utils/contentEnhancer');
const articleRoutes = require('./routes/articleRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use('/api/v1/articles', articleRoutes);

const startServer = async () => {
  await connectDB();
  await scrapeAndSeed();
  await enhanceArticles();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();
