const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDashboard, getProductivityStats } = require('../controllers/analyticsController');

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/productivity', getProductivityStats);

module.exports = router;
