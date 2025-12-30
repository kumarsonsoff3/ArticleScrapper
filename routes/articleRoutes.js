const express = require('express');
const router = express.Router();
const controllers = require('../controllers');

router.route('/').get(controllers.getArticles).post(controllers.createArticle);

router
  .route('/:id')
  .patch(controllers.updateArticle)
  .delete(controllers.deleteArticle);

module.exports = router;
