const Task = require('../models/Task');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

/**
 * @route   GET /api/tasks
 * @access  Protected
 */
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, tag, search, page = 1, limit = 20, board } = req.query;
    const query = { owner: req.user._id };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (tag) query.tags = tag;
    if (search) query.title = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Task.countDocuments(query);

    let tasks;
    if (board === 'kanban') {
      // Return grouped by status for kanban view
      const allStatuses = ['todo', 'in-progress', 'review', 'completed'];
      const grouped = {};
      for (const s of allStatuses) {
        grouped[s] = await Task.find({ ...query, status: s })
          .sort({ order: 1, createdAt: -1 })
          .populate('assignees', 'name avatar email');
      }
      return sendSuccess(res, { board: grouped, total }, 'Kanban board fetched');
    }

    tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('assignees', 'name avatar email');

    return sendPaginated(
      res,
      tasks,
      { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tasks
 * @access  Protected
 */
const createTask = async (req, res, next) => {
  try {
    const taskData = { ...req.body, owner: req.user._id };
    const task = await Task.create(taskData);
    
    // Emit socket event if available
    if (req.io) {
      req.io.to(req.user._id.toString()).emit('task:created', task);
    }

    return sendSuccess(res, { task }, 'Task created', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks/:id
 * @access  Protected
 */
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
      .populate('assignees', 'name avatar email');

    if (!task) return sendError(res, 'Task not found', 404);
    return sendSuccess(res, { task });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/tasks/:id
 * @access  Protected
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('assignees', 'name avatar email');

    if (!task) return sendError(res, 'Task not found', 404);

    // Real-time update
    if (req.io) {
      req.io.emit('task:updated', task);
    }

    return sendSuccess(res, { task }, 'Task updated');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @access  Protected
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!task) return sendError(res, 'Task not found', 404);

    if (req.io) {
      req.io.to(req.user._id.toString()).emit('task:deleted', { id: req.params.id });
    }

    return sendSuccess(res, {}, 'Task deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/tasks/:id/status
 * @access  Protected
 */
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['todo', 'in-progress', 'review', 'completed'];
    if (!validStatuses.includes(status)) {
      return sendError(res, 'Invalid status', 400);
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: { status } },
      { new: true }
    );

    if (!task) return sendError(res, 'Task not found', 404);

    if (req.io) {
      req.io.emit('task:updated', task);
    }

    return sendSuccess(res, { task }, 'Status updated');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tasks/:id/subtasks
 * @access  Protected
 */
const addSubtask = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) return sendError(res, 'Subtask title required', 400);

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $push: { subtasks: { title } } },
      { new: true }
    );

    if (!task) return sendError(res, 'Task not found', 404);
    return sendSuccess(res, { task }, 'Subtask added');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/tasks/:id/subtasks/:subtaskId
 * @access  Protected
 */
const updateSubtask = async (req, res, next) => {
  try {
    const { completed } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id, 'subtasks._id': req.params.subtaskId },
      {
        $set: {
          'subtasks.$.completed': completed,
          ...(completed ? { 'subtasks.$.completedAt': new Date() } : {}),
        },
      },
      { new: true }
    );
    if (!task) return sendError(res, 'Task or subtask not found', 404);
    return sendSuccess(res, { task }, 'Subtask updated');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/tasks/reorder
 * @access  Protected
 * Body: { tasks: [{ id, status, order }] }
 */
const reorderTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body;
    const bulkOps = tasks.map(({ id, status, order }) => ({
      updateOne: {
        filter: { _id: id, owner: req.user._id },
        update: { $set: { status, order } },
      },
    }));
    await Task.bulkWrite(bulkOps);
    return sendSuccess(res, {}, 'Tasks reordered');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  addSubtask,
  updateSubtask,
  reorderTasks,
};
