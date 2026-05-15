const mongoose = require('mongoose');

const habitEntrySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  completed: { type: Boolean, default: false },
  note: { type: String, trim: true },
});

const habitSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
      maxlength: [100, 'Habit name too long'],
    },
    description: { type: String, trim: true },
    icon: { type: String, default: '🎯' },
    color: { type: String, default: '#3b6dfb' },
    frequency: {
      type: String,
      enum: ['daily', 'weekdays', 'weekends', 'weekly'],
      default: 'daily',
    },
    targetDays: { type: Number, default: 30 },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastCompleted: { type: Date },
    },
    entries: [habitEntrySchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Method to check in for today
habitSchema.methods.checkIn = function (note = '') {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = this.entries.find((e) => {
    const d = new Date(e.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  if (existing) {
    existing.completed = !existing.completed;
    existing.note = note;
  } else {
    this.entries.push({ date: today, completed: true, note });
  }

  // Update streak
  const lastDate = this.streak.lastCompleted
    ? new Date(this.streak.lastCompleted)
    : null;
  if (lastDate) {
    const diff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      this.streak.current += 1;
    } else if (diff > 1) {
      this.streak.current = 1;
    }
  } else {
    this.streak.current = 1;
  }

  if (this.streak.current > this.streak.longest) {
    this.streak.longest = this.streak.current;
  }
  this.streak.lastCompleted = today;

  return this;
};

// Virtual: completion rate (last 30 days)
habitSchema.virtual('completionRate').get(function () {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const recent = this.entries.filter(
    (e) => new Date(e.date) >= thirtyDaysAgo && e.completed
  );
  return Math.round((recent.length / 30) * 100);
});

habitSchema.set('toJSON', { virtuals: true });
habitSchema.index({ owner: 1, isActive: 1 });

module.exports = mongoose.model('Habit', habitSchema);
