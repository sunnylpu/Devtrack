const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTaskSuggestions, breakdownTask, getWeeklySummary, getProductivityTips } = require('../controllers/aiController');

router.use(protect);

router.post('/task-suggestions', getTaskSuggestions);
router.post('/task-breakdown', breakdownTask);
router.get('/weekly-summary', getWeeklySummary);
router.get('/productivity-tips', getProductivityTips);

module.exports = router;
