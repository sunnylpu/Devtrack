const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getHabits, createHabit, checkIn, updateHabit, deleteHabit, getStats
} = require('../controllers/habitController');

const router = express.Router();

router.use(protect);

router.get('/', getHabits);
router.get('/stats', getStats);
router.post('/', createHabit);
router.put('/:id', updateHabit);
router.put('/:id/checkin', checkIn);
router.delete('/:id', deleteHabit);

module.exports = router;
