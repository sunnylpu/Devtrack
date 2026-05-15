const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { connectGitHub, githubCallback, getActivity, getHeatmap, disconnectGitHub } = require('../controllers/githubController');

router.get('/connect', protect, connectGitHub);
router.get('/callback', githubCallback);
router.get('/activity', protect, getActivity);
router.get('/heatmap', protect, getHeatmap);
router.delete('/disconnect', protect, disconnectGitHub);

module.exports = router;
