const article = require('../models/article');

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

module.exports = { getArticles };
