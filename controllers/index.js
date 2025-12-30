const { createArticle } = require('./createArticles');
const { getArticles } = require('./getArticles');
const { updateArticle } = require('./updateArticle');
const { deleteArticle } = require('./deleteArticle');

module.exports = {
  createArticle,
  getArticles,
  updateArticle,
  deleteArticle,
};
