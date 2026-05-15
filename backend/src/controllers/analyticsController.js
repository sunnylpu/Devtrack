const Task = require('../models/Task');
const User = require('../models/User');
const { sendSuccess } = require('../utils/response');

/**
 * @route   GET /api/analytics/dashboard
 * @access  Protected
 * Returns aggregated analytics for the current user
 */
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const [
      totalTasks,
      completedTasks,
      completedThisWeek,
      completedThisMonth,
      inProgressTasks,
      overdueTasks,
      tasksByPriority,
      tasksByStatus,
      completionTrend,
    ] = await Promise.all([
      Task.countDocuments({ owner: userId }),
      Task.countDocuments({ owner: userId, status: 'completed' }),
      Task.countDocuments({
        owner: userId,
        status: 'completed',
        completedAt: { $gte: startOfWeek },
      }),
      Task.countDocuments({
        owner: userId,
        status: 'completed',
        completedAt: { $gte: startOfMonth },
      }),
      Task.countDocuments({ owner: userId, status: 'in-progress' }),
      Task.countDocuments({
        owner: userId,
        status: { $ne: 'completed' },
        deadline: { $lt: now },
      }),
      Task.aggregate([
        { $match: { owner: userId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { owner: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      // Last 30 days completion trend
      Task.aggregate([
        {
          $match: {
            owner: userId,
            status: 'completed',
            completedAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$completedAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const productivityScore = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    return sendSuccess(res, {
      overview: {
        totalTasks,
        completedTasks,
        completedThisWeek,
        completedThisMonth,
        inProgressTasks,
        overdueTasks,
        productivityScore,
      },
      charts: {
        tasksByPriority,
        tasksByStatus,
        completionTrend,
      },
      streak: req.user.streak,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/productivity
 * @access  Protected
 */
const getProductivityStats = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const trend = await Task.aggregate([
      {
        $match: {
          owner: req.user._id,
          status: 'completed',
          completedAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 },
          tasks: { $push: { title: '$title', priority: '$priority' } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return sendSuccess(res, { trend, days: parseInt(days) });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getProductivityStats };
