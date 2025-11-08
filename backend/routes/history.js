const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, historyController.getByUser.bind(historyController));
router.get('/comic/:comicId', authenticateToken, historyController.getByComic.bind(historyController));
router.post('/', authenticateToken, historyController.add.bind(historyController));

module.exports = router;

