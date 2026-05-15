const { Queue, Worker } = require('bullmq');
const nodemailer = require('nodemailer');
const IORedis = require('ioredis');
const logger = require('../utils/logger');

let emailQueue = null;
let reminderQueue = null;
let analyticsQueue = null;
let redisAvailable = false;

// ─── Check Redis before creating queues ───────────────────────────────────────
const checkRedis = () => {
  return new Promise((resolve) => {
    const testConn = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
      lazyConnect: true,
      connectTimeout: 2000,
      enableOfflineQueue: false,
    });

    // Suppress unhandled error event from ioredis
    testConn.on('error', () => {});

    testConn.connect()
      .then(() => {
        testConn.disconnect();
        resolve(true);
      })
      .catch(() => {
        testConn.disconnect();
        resolve(false);
      });
  });
};

// Redis connection config — limited retries to avoid console spam
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
};

// Create mailer
const createTransporter = () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return null;
};

const transporter = createTransporter();

// ─── Queue Creators (only called when Redis is available) ─────────────────────
const createQueues = () => {
  // Email
  emailQueue = new Queue('email', { connection: redisConnection });
  new Worker('email', async (job) => {
    const { to, subject, html } = job.data;
    if (!transporter) {
      logger.info(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
      return;
    }
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'DevTrack Pro <noreply@devtrack.pro>',
      to, subject, html,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
  }, { connection: redisConnection });

  // Reminders
  reminderQueue = new Queue('reminders', { connection: redisConnection });
  new Worker('reminders', async (job) => {
    const { userId, taskTitle, email } = job.data;
    logger.info(`Task reminder: ${taskTitle} for user ${userId}`);
    if (emailQueue) {
      await emailQueue.add('task-reminder', {
        to: email,
        subject: `⏰ Reminder: "${taskTitle}" is due soon`,
        html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto"><h2 style="color:#3b6dfb">DevTrack Pro Reminder</h2><p>Your task <strong>"${taskTitle}"</strong> is due soon!</p><a href="${process.env.FRONTEND_URL}/tasks" style="background:#3b6dfb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">View Task</a></div>`,
      });
    }
  }, { connection: redisConnection });

  // Analytics
  analyticsQueue = new Queue('analytics', { connection: redisConnection });
  new Worker('analytics', async (job) => {
    const { type, userId } = job.data;
    logger.info(`Analytics job: ${type} for user ${userId}`);
  }, { connection: redisConnection });

  logger.info('✅ BullMQ queues ready (email, reminders, analytics)');
};

// ─── Public API ───────────────────────────────────────────────────────────────
const initQueues = async () => {
  redisAvailable = await checkRedis();
  if (!redisAvailable) {
    logger.info('ℹ️  Redis not running — BullMQ queues disabled (app works fine without them)');
    return;
  }
  createQueues();
};

const scheduleTaskReminder = async (userId, taskId, taskTitle, email, runAt) => {
  if (!reminderQueue) return;
  const delay = runAt ? Math.max(0, new Date(runAt) - Date.now() - 60 * 60 * 1000) : 0;
  await reminderQueue.add('reminder', { userId, taskId, taskTitle, email }, { delay });
};

const sendWelcomeEmail = async (email, name) => {
  if (!emailQueue) {
    logger.info(`[EMAIL MOCK] Welcome email to ${email}`);
    return;
  }
  await emailQueue.add('welcome', {
    to: email,
    subject: '🚀 Welcome to DevTrack Pro!',
    html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px"><h1 style="color:#3b6dfb">Welcome, ${name}! 👋</h1><p>You've joined DevTrack Pro — your AI-powered developer productivity platform.</p><a href="${process.env.FRONTEND_URL}/dashboard" style="background:linear-gradient(135deg,#3b6dfb,#7c3aed);color:white;padding:14px 28px;border-radius:10px;text-decoration:none;display:inline-block;margin-top:20px;font-weight:bold">Get Started →</a></div>`,
  });
};

module.exports = { initQueues, scheduleTaskReminder, sendWelcomeEmail };
