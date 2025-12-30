const article = require('../models/article');

const createArticle = async (req, res) => {
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

module.exports = { createArticle };
