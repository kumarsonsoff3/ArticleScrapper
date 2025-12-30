require('dotenv').config();
const express = require('express');
const https = require('https');
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
    await article.deleteMany({});
    console.log(`Database cleared. Started Scrapping...`);

    const baseURL = 'https://beyondchats.com/blogs/';
    console.log(`Fetching main page to find pagination: ${baseURL}`);

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const axiosOptions = {
      httpsAgent: httpsAgent,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      },
    };

    const { data: mainData } = await axios.get(baseURL, axiosOptions);
    const $main = cheerio.load(mainData);

    let lastPageNum = 1;
    const pageNumbers = [];

    $main('.page-numbers').each((i, el) => {
      const num = parseInt($main(el).text());
      if (!isNaN(num)) pageNumbers.push(num);
    });

    if (pageNumbers.length > 0) {
      lastPageNum = Math.max(...pageNumbers);
    }

    const extractArticles = ($) => {
      const pageArticles = [];

      $('.entry-card').each((index, element) => {
        const title = $(element).find('h2').text().trim();
        const content = $(element).find('.entry-excerpt').text().trim();
        const link = $(element).find('a').attr('href');
        const image = $(element).find('img').attr('src');
        const author = $(element).find('.ct-meta-element-author').text().trim();
        const datePublished = $(element)
          .find('.ct-meta-element-date')
          .text()
          .trim();

        if (title && link) {
          pageArticles.push({
            title,
            content,
            link,
            image,
            author,
            datePublished,
          });
        }
      });
      return pageArticles;
    };

    const targetURL =
      lastPageNum > 1 ? `${baseURL}page/${lastPageNum}/` : baseURL;

    console.log(`Fetching last page: ${targetURL}`);

    const { data } = await axios.get(targetURL, axiosOptions);
    const $ = cheerio.load(data);

    let articles = extractArticles($);

    if (articles.length < 5 && lastPageNum > 1) {
      console.log(
        `Last page only had ${articles.length} articles. Fetching previous page...`
      );

      const prePageNum = lastPageNum - 1;
      const prevURL =
        prePageNum > 1 ? `${baseURL}page/${prePageNum}/` : baseURL;

      const { data: prevData } = await axios.get(prevURL, axiosOptions);
      const $prev = cheerio.load(prevData);

      const prevArticles = extractArticles($prev);
      articles = [...prevArticles, ...articles];
    }

    const oldestArticles = articles.slice(-5);

    if (oldestArticles.length > 0) {
      await article.insertMany(oldestArticles);
      console.log(`Successfully scrapped ${oldestArticles.length} articles.`);
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
