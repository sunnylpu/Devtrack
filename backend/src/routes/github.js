const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { connectGitHub, githubCallback, getActivity, getHeatmap, disconnectGitHub, getPublicProfile, getPublicRepos, getPublicRecent } = require('../controllers/githubController');

router.get('/connect', protect, connectGitHub);
router.get('/callback', githubCallback);
router.get('/activity', protect, getActivity);
router.get('/heatmap', protect, getHeatmap);
// Public username-based lookups (no auth required)
router.get('/profile/:username', getPublicProfile);
router.get('/repos/:username', getPublicRepos);
router.get('/recent/:username', getPublicRecent);
router.delete('/disconnect', protect, disconnectGitHub);

module.exports = router;
