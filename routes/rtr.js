const express = require('express');
const router = new express.Router();
const controller = require('../controllers/controller');
const middleware = require('../middleware/bot')

router.post('/bot',
middleware.logger,
middleware.downloader,
middleware.mp3NameFixer,
controller.Respond_logger   
);

module.exports = router;