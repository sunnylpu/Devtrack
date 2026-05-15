const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
});

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'completed'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    tags: [{ type: String, trim: true }],
    subtasks: [subtaskSchema],
    deadline: { type: Date },
    completedAt: { type: Date },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isRecurring: { type: Boolean, default: false },
    recurringPattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', null],
      default: null,
    },
    order: { type: Number, default: 0 },
    estimatedHours: { type: Number, min: 0 },
    actualHours: { type: Number, min: 0 },
    aiGenerated: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Auto-set completedAt when status changes to completed
taskSchema.pre('save', function () {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
});

// Virtual: completion percentage of subtasks
taskSchema.virtual('subtaskProgress').get(function () {
  if (!this.subtasks.length) return 0;
  const done = this.subtasks.filter((s) => s.completed).length;
  return Math.round((done / this.subtasks.length) * 100);
});

taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

// Index for faster queries
taskSchema.index({ owner: 1, status: 1 });
taskSchema.index({ owner: 1, deadline: 1 });

module.exports = mongoose.model('Task', taskSchema);
