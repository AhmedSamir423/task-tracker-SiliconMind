const express = require('express');
const dotenv = require('dotenv');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../database/models');
const models = require('../database/models');
const { Task } = require('../database/models');
const { logger, morganMiddleware } = require('./logger');

models.sequelize
  .authenticate()
  .then(() => logger.info('Database connected'))
  .catch((err) => logger.error('Database connection failed:', err));
dotenv.config({ path: '../root.env' });
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());
app.use(morganMiddleware); // HTTP request logging

// Middleware to authenticate JWT
const authenticateToken = require('./middleware/auth');

app.post(
  '/api/auth/signup',
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await User.create({ email, password: hashedPassword });

      logger.info('User created', { email });
      res.status(201).json({ message: 'User created' });
    } catch (error) {
      logger.error('Signup error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

app.post(
  '/api/auth/login',
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      // Check if user exists
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Compare hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      logger.info('User logged in', { userId: user.user_id });
      res.status(200).json({ token });
    } catch (error) {
      logger.error('Login error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Create task route
app.post(
  '/api/tasks',
  authenticateToken, // Apply authentication middleware
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('estimate').isFloat({ min: 0 }).withMessage('Estimate must be a positive number'),
    body('status')
      .isIn(['To do', 'In Progress', 'Done'])
      .withMessage('Status must be To do, In Progress, or Done'),
    body('description').optional().trim(),
    body('completed_at').optional().isISO8601().toDate(),
    body('loggedtime').optional().isFloat({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, estimate, status, description, completed_at, loggedtime } = req.body;
      const newTask = await Task.create({
        user_id: req.user.userId, // From authenticated token
        title,
        estimate,
        status,
        description,
        completed_at,
        loggedtime,
      });

      logger.info('Task created', { taskId: newTask.task_id, userId: req.user.userId });
      res.status(201).json(newTask);
    } catch (error) {
      logger.error('Task creation error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get all tasks for the authenticated user
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { user_id: req.user.userId },
      attributes: [
        'task_id',
        'title',
        'description',
        'estimate',
        'status',
        'completed_at',
        'loggedtime',
      ],
    });
    logger.info('Tasks retrieved', { userId: req.user.userId, count: tasks.length });
    res.status(200).json(tasks);
  } catch (error) {
    logger.error('Get tasks error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific task by ID
app.get('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({
      where: {
        task_id: req.params.id,
        user_id: req.user.userId,
      },
      attributes: [
        'task_id',
        'title',
        'description',
        'estimate',
        'status',
        'completed_at',
        'loggedtime',
      ],
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found or not authorized' });
    }

    logger.info('Task retrieved', { taskId: req.params.id, userId: req.user.userId });
    res.status(200).json(task);
  } catch (error) {
    logger.error('Get task error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a specific task
app.patch(
  '/api/tasks/:id',
  authenticateToken,
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim(),
    body('estimate')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Estimate must be a positive number'),
    body('status')
      .optional()
      .isIn(['To do', 'In Progress', 'Done'])
      .withMessage('Status must be To do, In Progress, or Done'),
    body('completed_at').optional().isISO8601().toDate(),
    body('loggedtime')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Logged time must be a positive number'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updates = req.body;
      const task = await Task.findOne({
        where: {
          task_id: id,
          user_id: req.user.userId,
        },
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found or not authorized' });
      }

      // Update only the provided fields
      await task.update(updates);

      // Return the updated task
      const updatedTask = await Task.findOne({
        where: { task_id: id },
        attributes: [
          'task_id',
          'title',
          'description',
          'estimate',
          'status',
          'completed_at',
          'loggedtime',
        ],
      });
      logger.info('Task updated', { taskId: id, userId: req.user.userId });
      res.status(200).json(updatedTask);
    } catch (error) {
      logger.error('Update task error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Log time for a specific task
app.patch(
  '/api/tasks/:id/time',
  authenticateToken,
  [body('logged_time').isFloat({ min: 0 }).withMessage('Logged time must be a positive number')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { logged_time } = req.body;

      const task = await Task.findOne({
        where: {
          task_id: id,
          user_id: req.user.userId,
        },
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found or not authorized' });
      }

      // Update loggedtime by adding the new logged_time
      task.loggedtime = (task.loggedtime || 0) + parseFloat(logged_time);
      await task.save();

      // Return the updated task
      const updatedTask = await Task.findOne({
        where: { task_id: id },
        attributes: [
          'task_id',
          'title',
          'description',
          'estimate',
          'status',
          'completed_at',
          'loggedtime',
        ],
      });
      logger.info('Time logged', { taskId: id, loggedTime: logged_time, userId: req.user.userId });
      res.status(200).json(updatedTask);
    } catch (error) {
      logger.error('Log time error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete a specific task
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({
      where: {
        task_id: id,
        user_id: req.user.userId,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found or not authorized' });
    }

    await task.destroy();
    logger.info('Task deleted', { taskId: id, userId: req.user.userId });
    res.status(204).send(); // No content response
  } catch (error) {
    logger.error('Delete task error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
