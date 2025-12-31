const axios = require('axios');
const cheerio = require('cheerio');
const Article = require('../models/article');
const { rewriteArticle } = require('./rewriteArticle');
const { searchGoogle } = require('./searchGoogle');

const scrapeExternalContent = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const content = $('article, main, .content, .post-content, p')
      .text()
      .replace(/\s+/g, ' ')
      .trim();
    return content.slice(0, 4000);
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return '';
  }
};

const enhanceArticles = async () => {
  console.log('Starting Phase 2 Enhancement with Gemini...');

  const articles = await Article.find({}).limit(5);

  for (const article of articles) {
    console.log(`Processing: ${article.title}`);

    const referenceLinks = await searchGoogle(article.title);

    if (referenceLinks.length === 0) {
      console.log('No reference links found, skipping.');
      continue;
    }

    const externalContents = [];
    for (const link of referenceLinks) {
      const content = await scrapeExternalContent(link);
      if (content) externalContents.push(content);
    }

    let newContent = await rewriteArticle(article.content, externalContents);

    newContent += `\n\n### References:\n`;
    referenceLinks.forEach((link) => {
      newContent += `- ${link}\n`;
    });

    article.content = newContent;
    await article.save();
    console.log(`Updated article: ${article.title}`);
  }
  console.log('Enhancement complete.');
};

module.exports = enhanceArticles;
