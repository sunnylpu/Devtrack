const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProfile,
  getCalendar,
  getRecentSubmissions,
  connectLeetCode,
  disconnectLeetCode,
} = require('../controllers/leetcodeController');

router.put('/connect', protect, connectLeetCode);
router.delete('/disconnect', protect, disconnectLeetCode);
router.get('/profile/:username', protect, getProfile);
router.get('/calendar/:username', protect, getCalendar);
router.get('/recent/:username', protect, getRecentSubmissions);

module.exports = router;
