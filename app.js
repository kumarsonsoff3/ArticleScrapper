require('dotenv').config();
console.log(process.env.MongoURI);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const article = require('./article');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(express.json());
app.use(cors());

async function scrapeAndSeed() {
  try {
    const count = await article.countDocuments();
    if (count > 0) {
      console.log(`Database already has data, skipping scrape.`);
      return;
    }
    console.log(`Database is empty, starting scrapping...`);

    const targetURL = 'https://beyondchats.com/blogs/';
    console.log(`Fetching: ${targetURL}`);

    const { data } = await axios.get(targetURL);
    const $ = cheerio.load(data);

    const articles = [];

    $('.entry-card').each((index, element) => {
      if (articles.length >= 5) return;

      const title = $(element).find('h2').text().trim();
      const content = $(element).find('.excerpt').text().trim();
      const link = $(element).find('a').attr('href');
      const image = $(element).find('img').attr('src');

      if (title && link) {
        articles.push({ title, content, link, image });
      }
    });

    if (articles.length > 0) {
      await article.insertMany(articles);
      console.log(`Successfully scrapped ${articles.length} articles.`);
    } else {
      console.log(`Not found articles.`);
    }
  } catch (err) {
    console.log(err.message);
  }
}

const getArticles = async (req, res) => {
  try {
    const articles = await article.find();
    res.status(200).json(articles);
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      error: err.message,
    });
  }
};

const createArticles = async (req, res) => {
  try {
    const newArticle = await article.create(req.body);
    res.status(201).json(newArticle);
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      error: err.message,
    });
  }
};

const updateArticle = async (req, res) => {
  try {
    const updated = await article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(400).json({ message: 'Article not found' });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      error: err.message,
    });
  }
};

const deleteArticle = async (req, res) => {
  try {
    await article.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      message: 'Article Deleted',
    });
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      error: err.message,
    });
  }
};

app.route('/api/v1/articles').get(getArticles).post(createArticles);

app.route('/api/v1/articles/:id').patch(updateArticle).delete(deleteArticle);

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log(`✅ Connected to MongoDB`);

    await scrapeAndSeed();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error(`DB Connection Error: `, err));
