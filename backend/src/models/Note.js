const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      default: '',
    },
    folder: {
      type: String,
      trim: true,
      default: 'General',
    },
    tags: [{ type: String, trim: true }],
    noteLanguage: {
      type: String,
      default: 'markdown',
    },
    codeSnippets: [
      {
        title: String,
        code: String,
        language: { type: String, default: 'javascript' },
      },
    ],
    isPinned: { type: Boolean, default: false },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for full-text search
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });
noteSchema.index({ owner: 1, folder: 1 });
noteSchema.index({ owner: 1, isPinned: -1, updatedAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
