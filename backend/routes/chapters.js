const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');

router.get('/comic/:comicId', chapterController.getByComicId.bind(chapterController));
router.post('/:id/views', chapterController.incrementViews.bind(chapterController)); // Endpoint riêng để tăng lượt xem
router.get('/:id', chapterController.getById.bind(chapterController));

module.exports = router;

