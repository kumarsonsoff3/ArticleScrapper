const axios = require('axios');
const cheerio = require('cheerio');
const { google } = require('googleapis');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Article = require('../models/article');

const customSearch = google.customsearch('v1');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const searchGoogle = async (query) => {
  try {
    const res = await customSearch.cse.list({
      cx: process.env.GOOGLE_CSE_ID,
      q: query,
      auth: process.env.GOOGLE_API_KEY,
      num: 5,
    });

    if (!res.data.items) return [];

    const links = res.data.items
      .filter(
        (item) =>
          !item.link.includes('youtube.com') &&
          !item.link.includes('facebook.com') &&
          !item.link.includes('www.amazon.com') &&
          !item.link.includes('medium.com') &&
          !item.link.includes('www.weforum.org')
      )
      .slice(0, 2)
      .map((item) => item.link);

    return links;
  } catch (error) {
    console.error('Error searching Google:', error.message);
    return [];
  }
};

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

const rewriteArticle = async (originalContent, externalContents) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = `
      You are an expert editor. 
      Original Article: "${originalContent.slice(0, 2000)}..."
      
      Reference Article 1: "${externalContents[0] || 'N/A'}"
      Reference Article 2: "${externalContents[1] || 'N/A'}"

      Task: Rewrite the original article to improve its formatting, depth, and quality based on the reference articles. 
      Ensure the tone is professional. 
      Return ONLY the new article content.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error calling Gemini:', error.message);
    return originalContent;
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
