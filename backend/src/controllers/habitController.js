const Habit = require('../models/Habit');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

// GET /api/habits
const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ owner: req.user._id, isActive: true }).sort({ createdAt: -1 });
    return sendSuccess(res, { habits }, 'Habits fetched');
  } catch (err) {
    logger.error('getHabits error:', err);
    return sendError(res, err.message, 500);
  }
};

// POST /api/habits
const createHabit = async (req, res) => {
  try {
    const { name, description, icon, color, frequency, targetDays } = req.body;
    const habit = await Habit.create({
      owner: req.user._id,
      name, description, icon, color, frequency, targetDays,
    });
    return sendSuccess(res, { habit }, 'Habit created', 201);
  } catch (err) {
    logger.error('createHabit error:', err);
    return sendError(res, err.message, 400);
  }
};

// PUT /api/habits/:id/checkin
const checkIn = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, owner: req.user._id });
    if (!habit) return sendError(res, 'Habit not found', 404);

    habit.checkIn(req.body.note || '');
    await habit.save();

    return sendSuccess(res, { habit }, 'Check-in recorded');
  } catch (err) {
    logger.error('checkIn error:', err);
    return sendError(res, err.message, 500);
  }
};

// PUT /api/habits/:id
const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!habit) return sendError(res, 'Habit not found', 404);
    return sendSuccess(res, { habit }, 'Habit updated');
  } catch (err) {
    logger.error('updateHabit error:', err);
    return sendError(res, err.message, 400);
  }
};

// DELETE /api/habits/:id
const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!habit) return sendError(res, 'Habit not found', 404);
    return sendSuccess(res, {}, 'Habit deleted');
  } catch (err) {
    logger.error('deleteHabit error:', err);
    return sendError(res, err.message, 500);
  }
};

// GET /api/habits/stats
const getStats = async (req, res) => {
  try {
    const habits = await Habit.find({ owner: req.user._id, isActive: true });
    const stats = {
      totalHabits: habits.length,
      totalCompletedToday: habits.filter((h) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return h.entries.some((e) => {
          const d = new Date(e.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === today.getTime() && e.completed;
        });
      }).length,
      longestStreak: Math.max(...habits.map((h) => h.streak.longest), 0),
      averageCompletionRate: Math.round(
        habits.reduce((sum, h) => sum + h.completionRate, 0) / (habits.length || 1)
      ),
    };
    return sendSuccess(res, { stats, habits }, 'Stats fetched');
  } catch (err) {
    logger.error('getStats error:', err);
    return sendError(res, err.message, 500);
  }
};

module.exports = { getHabits, createHabit, checkIn, updateHabit, deleteHabit, getStats };
