const article = require('../models/article');

const updateArticle = async (req, res) => {
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

module.exports = { updateArticle };
