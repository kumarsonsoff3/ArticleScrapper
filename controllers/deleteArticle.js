const article = require('../models/article');

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

module.exports = { deleteArticle };
