const article = require('../models/article');

exports.getArticles = async (req, res) => {
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

exports.createArticle = async (req, res) => {
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

exports.updateArticle = async (req, res) => {
  try {
    const updated = await article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      error: err.message,
    });
  }
};

exports.deleteArticle = async (req, res) => {
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
