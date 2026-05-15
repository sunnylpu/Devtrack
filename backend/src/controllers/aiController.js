const { sendSuccess, sendError } = require('../utils/response');
const Task = require('../models/Task');

/**
 * AI Productivity Assistant using OpenAI
 * Falls back to smart mock responses if no API key is set
 */

const callOpenAI = async (messages, maxTokens = 500) => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key') {
    return null; // Will trigger mock mode
  }
  const axios = require('axios');
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices[0].message.content;
};

/**
 * @route   POST /api/ai/task-suggestions
 * @access  Protected
 */
const getTaskSuggestions = async (req, res, next) => {
  try {
    const recentTasks = await Task.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title priority status tags');

    const taskList = recentTasks.map((t) => `- ${t.title} [${t.status}]`).join('\n');

    const messages = [
      {
        role: 'system',
        content:
          'You are a developer productivity AI assistant. Suggest 3-5 next actionable tasks based on the developer\'s recent task history. Be specific and developer-focused.',
      },
      {
        role: 'user',
        content: `My recent tasks:\n${taskList}\n\nSuggest 5 next productive tasks I should work on. Return as a JSON array of objects with { title, priority, reason }.`,
      },
    ];

    let suggestions;
    const aiResponse = await callOpenAI(messages, 600);

    if (aiResponse) {
      try {
        const match = aiResponse.match(/\[[\s\S]*\]/);
        suggestions = match ? JSON.parse(match[0]) : [];
      } catch {
        suggestions = [];
      }
    } else {
      // Smart mock suggestions
      suggestions = [
        { title: 'Write unit tests for authentication module', priority: 'high', reason: 'Ensures code reliability' },
        { title: 'Refactor API error handling', priority: 'medium', reason: 'Improves maintainability' },
        { title: 'Review and update project README', priority: 'low', reason: 'Helps onboarding' },
        { title: 'Implement request caching with Redis', priority: 'high', reason: 'Improves performance' },
        { title: 'Set up CI/CD pipeline', priority: 'medium', reason: 'Automates deployment' },
      ];
    }

    return sendSuccess(res, { suggestions, aiPowered: !!process.env.OPENAI_API_KEY });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/ai/task-breakdown
 * @access  Protected
 */
const breakdownTask = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title) return sendError(res, 'Task title required', 400);

    const messages = [
      {
        role: 'system',
        content:
          'You are a senior software developer. Break down a task into specific, actionable subtasks. Focus on technical implementation steps.',
      },
      {
        role: 'user',
        content: `Break down this task into subtasks:\nTitle: ${title}\n${description ? `Description: ${description}` : ''}\n\nReturn as JSON array: [{ "title": "subtask title" }]. Maximum 8 subtasks.`,
      },
    ];

    let subtasks;
    const aiResponse = await callOpenAI(messages, 500);

    if (aiResponse) {
      try {
        const match = aiResponse.match(/\[[\s\S]*\]/);
        subtasks = match ? JSON.parse(match[0]) : [];
      } catch {
        subtasks = [];
      }
    } else {
      // Mock breakdown
      subtasks = [
        { title: 'Research and plan approach' },
        { title: 'Set up necessary dependencies' },
        { title: 'Implement core functionality' },
        { title: 'Add error handling' },
        { title: 'Write tests' },
        { title: 'Code review and refactor' },
        { title: 'Update documentation' },
      ];
    }

    return sendSuccess(res, { subtasks, aiPowered: !!process.env.OPENAI_API_KEY });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/ai/weekly-summary
 * @access  Protected
 */
const getWeeklySummary = async (req, res, next) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const [completed, created, overdue] = await Promise.all([
      Task.countDocuments({
        owner: req.user._id,
        status: 'completed',
        completedAt: { $gte: startOfWeek },
      }),
      Task.countDocuments({
        owner: req.user._id,
        createdAt: { $gte: startOfWeek },
      }),
      Task.countDocuments({
        owner: req.user._id,
        status: { $ne: 'completed' },
        deadline: { $lt: new Date() },
      }),
    ]);

    const productivityRate = created > 0 ? Math.round((completed / created) * 100) : 0;

    const messages = [
      {
        role: 'system',
        content: 'You are a developer productivity coach. Generate an encouraging weekly summary.',
      },
      {
        role: 'user',
        content: `Generate a 2-3 sentence weekly summary for a developer who:\n- Completed ${completed} tasks\n- Created ${created} new tasks\n- Has ${overdue} overdue tasks\n- Productivity rate: ${productivityRate}%\n\nBe encouraging and specific. Include one actionable tip for next week.`,
      },
    ];

    let summary;
    const aiResponse = await callOpenAI(messages, 200);

    if (aiResponse) {
      summary = aiResponse;
    } else {
      const encouragement = productivityRate >= 70
        ? 'Excellent work this week!'
        : productivityRate >= 40
        ? 'Good progress this week!'
        : 'Keep pushing - every task completed is progress!';

      summary = `${encouragement} You completed ${completed} tasks out of ${created} created, achieving a ${productivityRate}% productivity rate. ${overdue > 0 ? `Focus on clearing the ${overdue} overdue task${overdue > 1 ? 's' : ''} next week first.` : 'No overdue tasks - great time management!'} Tip: Try time-blocking your calendar for deep work sessions next week.`;
    }

    return sendSuccess(res, {
      summary,
      stats: { completed, created, overdue, productivityRate },
      aiPowered: !!process.env.OPENAI_API_KEY,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/ai/productivity-tips
 * @access  Protected
 */
const getProductivityTips = async (req, res, next) => {
  try {
    const tips = [
      { id: 1, tip: 'Use the 2-minute rule: if a task takes less than 2 minutes, do it now.', category: 'time-management' },
      { id: 2, tip: 'Work in Pomodoro cycles (25 min focus + 5 min break) for sustained concentration.', category: 'focus' },
      { id: 3, tip: 'Review and plan your next day tasks before you end work each day.', category: 'planning' },
      { id: 4, tip: 'Batch similar tasks together to reduce context switching overhead.', category: 'efficiency' },
      { id: 5, tip: 'Start with your most important/hardest task first (eat the frog!).', category: 'prioritization' },
      { id: 6, tip: 'Keep a coding journal to track what you learned and solved each day.', category: 'learning' },
      { id: 7, tip: 'Set artificial deadlines for tasks to create urgency and focus.', category: 'time-management' },
      { id: 8, tip: 'Take regular breaks to avoid burnout and maintain long-term productivity.', category: 'wellbeing' },
    ];

    // Shuffle and return 4 random tips
    const shuffled = tips.sort(() => Math.random() - 0.5).slice(0, 4);
    return sendSuccess(res, { tips: shuffled });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTaskSuggestions, breakdownTask, getWeeklySummary, getProductivityTips };
