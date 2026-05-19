import express from 'express'
import controller from '../controllers/controller.js'
import middleware from '../middleware/bot.js'
const router = express.Router();

router.post('/bot',
middleware.logger,
middleware.downloader,
middleware.mp3NameFixer,
controller.Respond_logger
);

export default router;
