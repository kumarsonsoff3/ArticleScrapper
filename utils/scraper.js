const https = require('https');
const article = require('../models/article');
const axios = require('axios');
const cheerio = require('cheerio');

const scrapeAndSeed = async function () {
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
};

module.exports = scrapeAndSeed;
