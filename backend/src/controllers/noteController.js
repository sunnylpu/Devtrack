const Note = require('../models/Note');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

/**
 * @route   GET /api/notes
 * @access  Protected
 */
const getNotes = async (req, res, next) => {
  try {
    const { folder, tag, page = 1, limit = 20, pinned } = req.query;
    const query = { owner: req.user._id };

    if (folder) query.folder = folder;
    if (tag) query.tags = tag;
    if (pinned === 'true') query.isPinned = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Note.countDocuments(query);

    const notes = await Note.find(query)
      .sort({ isPinned: -1, updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content'); // Don't return full content in list view

    return sendPaginated(
      res,
      notes,
      { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/notes/search
 * @access  Protected
 */
const searchNotes = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return sendError(res, 'Search query required', 400);

    const notes = await Note.find(
      {
        owner: req.user._id,
        $text: { $search: q },
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .select('-codeSnippets');

    return sendSuccess(res, { notes, count: notes.length });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/notes/folders
 * @access  Protected
 */
const getFolders = async (req, res, next) => {
  try {
    const folders = await Note.distinct('folder', { owner: req.user._id });
    return sendSuccess(res, { folders });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/notes/:id
 * @access  Protected
 */
const getNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user._id });
    if (!note) return sendError(res, 'Note not found', 404);
    return sendSuccess(res, { note });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/notes
 * @access  Protected
 */
const createNote = async (req, res, next) => {
  try {
    const note = await Note.create({ ...req.body, owner: req.user._id });
    return sendSuccess(res, { note }, 'Note created', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/notes/:id
 * @access  Protected
 */
const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!note) return sendError(res, 'Note not found', 404);
    return sendSuccess(res, { note }, 'Note updated');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/notes/:id
 * @access  Protected
 */
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!note) return sendError(res, 'Note not found', 404);
    return sendSuccess(res, {}, 'Note deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/notes/:id/pin
 * @access  Protected
 */
const togglePin = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user._id });
    if (!note) return sendError(res, 'Note not found', 404);

    note.isPinned = !note.isPinned;
    await note.save();
    return sendSuccess(res, { note }, `Note ${note.isPinned ? 'pinned' : 'unpinned'}`);
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotes, searchNotes, getFolders, getNote, createNote, updateNote, deleteNote, togglePin };
