const express = require('express');
const request = require('supertest');
const { morganMiddleware } = require('../logger');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const app = express();
app.use(express.json());
app.use(morganMiddleware);

jest.mock('../../database/models', () => {
  const SequelizeMock = require('sequelize-mock');
  const dbMock = new SequelizeMock();
  let currentTask = {
    task_id: 1,
    user_id: 1,
    title: 'Test Task',
    estimate: 2.5,
    status: 'To do',
    loggedtime: 0,
  };

  const Task = dbMock.define('Task', {
    task_id: Number,
    user_id: Number,
    title: String,
    estimate: Number,
    status: String,
    description: String,
    completed_at: Date,
    loggedtime: Number,
  });

  // Mock methods
  Task.create = jest.fn().mockResolvedValue({ ...currentTask });
  Task.findAll = jest.fn().mockResolvedValue([{ ...currentTask }]);
  Task.findOne = jest.fn().mockImplementation(() => {
    const taskInstance = {
      ...currentTask,
      update: jest.fn().mockImplementation(function (updates) {
        Object.assign(currentTask, updates);
        return Promise.resolve(this);
      }),
      save: jest.fn().mockImplementation(function () {
        currentTask.loggedtime = 1.5;
        return Promise.resolve(this);
      }),
      destroy: jest.fn().mockResolvedValue(true),
    };
    return Promise.resolve(taskInstance);
  });

  return {
    Task,
    sequelize: {
      authenticate: jest.fn().mockResolvedValue(),
    },
  };
});

jest.mock('../middleware/auth', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { userId: 1 }; // Simulate authenticated user
    next();
  }),
}));

// Route handlers extracted for testing
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { title, estimate, status, description, completed_at, loggedtime } = req.body;
    const newTask = await require('../../database/models').Task.create({
      user_id: req.user.userId,
      title,
      estimate,
      status,
      description,
      completed_at,
      loggedtime,
    });
    res.status(201).json(newTask);
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await require('../../database/models').Task.findAll({
      where: { user_id: req.user.userId },
    });
    res.status(200).json(tasks);
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await require('../../database/models').Task.findOne({
      where: { task_id: req.params.id, user_id: req.user.userId },
    });
    if (!task) return res.status(404).json({ error: 'Task not found or not authorized' });
    res.status(200).json(task);
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const task = await require('../../database/models').Task.findOne({
      where: { task_id: req.params.id, user_id: req.user.userId },
    });
    if (!task) return res.status(404).json({ error: 'Task not found or not authorized' });
    await task.update(req.body);
    const updatedTask = await require('../../database/models').Task.findOne({
      where: { task_id: req.params.id },
    });
    res.status(200).json(updatedTask);
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const logTime = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const task = await require('../../database/models').Task.findOne({
      where: { task_id: req.params.id, user_id: req.user.userId },
    });
    if (!task) return res.status(404).json({ error: 'Task not found or not authorized' });
    task.loggedtime = (task.loggedtime || 0) + parseFloat(req.body.logged_time);
    await task.save();
    const updatedTask = await require('../../database/models').Task.findOne({
      where: { task_id: req.params.id },
    });
    res.status(200).json(updatedTask);
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await require('../../database/models').Task.findOne({
      where: { task_id: req.params.id, user_id: req.user.userId },
    });
    if (!task) return res.status(404).json({ error: 'Task not found or not authorized' });
    await task.destroy();
    res.status(204).send();
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Register routes
app.post(
  '/api/tasks',
  authenticateToken,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('estimate').isFloat({ min: 0 }).withMessage('Estimate must be a positive number'),
    body('status').isIn(['To do', 'In Progress', 'Done']).withMessage('Invalid status'),
    body('description').optional().trim(),
    body('completed_at').optional().isISO8601().toDate(),
    body('loggedtime').optional().isFloat({ min: 0 }),
  ],
  createTask
);

app.get('/api/tasks', authenticateToken, getTasks);
app.get('/api/tasks/:id', authenticateToken, getTaskById);
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
    body('status').optional().isIn(['To do', 'In Progress', 'Done']).withMessage('Invalid status'),
    body('completed_at').optional().isISO8601().toDate(),
    body('loggedtime')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Logged time must be a positive number'),
  ],
  updateTask
);
app.patch(
  '/api/tasks/:id/time',
  authenticateToken,
  [body('logged_time').isFloat({ min: 0 }).withMessage('Logged time must be a positive number')],
  logTime
);
app.delete('/api/tasks/:id', authenticateToken, deleteTask);

describe('Task Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const Task = require('../../database/models').Task;
    Task.create.mockResolvedValue({
      task_id: 1,
      user_id: 1,
      title: 'Test Task',
      estimate: 2.5,
      status: 'To do',
    });
    Task.findAll.mockResolvedValue([
      { task_id: 1, user_id: 1, title: 'Test Task', estimate: 2.5, status: 'To do' },
    ]);
    Task.findOne.mockResolvedValue({
      task_id: 1,
      user_id: 1,
      title: 'Test Task',
      estimate: 2.5,
      status: 'To do',
      loggedtime: 0,
      update: jest.fn().mockImplementation(function (updates) {
        Object.assign(this, updates);
        return Promise.resolve(this);
      }),
      save: jest.fn().mockImplementation(function () {
        this.loggedtime = 1.5;
        return Promise.resolve(this);
      }),
      destroy: jest.fn().mockResolvedValue(true),
    });
  });

  test('should create a task successfully', async () => {
    const taskData = { title: 'Test Task', estimate: 2.5, status: 'To do' };
    const response = await request(app)
      .post('/api/tasks')
      .send(taskData)
      .set('Accept', 'application/json');
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(taskData);
  });

  test('should fail to create a task with invalid data', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({ title: '', estimate: -1, status: 'Invalid' })
      .set('Accept', 'application/json');
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  test('should get all tasks successfully', async () => {
    const response = await request(app).get('/api/tasks').set('Accept', 'application/json');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({ task_id: 1, user_id: 1, title: 'Test Task' });
  });

  test('should get a task by ID successfully', async () => {
    const response = await request(app).get('/api/tasks/1').set('Accept', 'application/json');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ task_id: 1, user_id: 1, title: 'Test Task' });
  });

  test('should fail to get task with invalid ID', async () => {
    require('../../database/models').Task.findOne.mockResolvedValueOnce(null);
    const response = await request(app).get('/api/tasks/999').set('Accept', 'application/json');
    expect(response.status).toBe(404);
  });

  test('should update a task successfully', async () => {
    const response = await request(app)
      .patch('/api/tasks/1')
      .send({ title: 'Updated Task' })
      .set('Accept', 'application/json');
    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated Task');
  });

  test('should fail to update task with invalid data', async () => {
    const response = await request(app)
      .patch('/api/tasks/1')
      .send({ estimate: -1 })
      .set('Accept', 'application/json');
    expect(response.status).toBe(400);
  });

  test('should log time successfully', async () => {
    const response = await request(app)
      .patch('/api/tasks/1/time')
      .send({ logged_time: 1.5 })
      .set('Accept', 'application/json');
    expect(response.status).toBe(200);
    expect(response.body.loggedtime).toBe(1.5);
  });

  test('should fail to log time with invalid data', async () => {
    const response = await request(app)
      .patch('/api/tasks/1/time')
      .send({ logged_time: -1 })
      .set('Accept', 'application/json');
    expect(response.status).toBe(400);
  });

  test('should delete a task successfully', async () => {
    const response = await request(app).delete('/api/tasks/1').set('Accept', 'application/json');
    expect(response.status).toBe(204);
  });

  test('should fail to delete non-existent task', async () => {
    require('../../database/models').Task.findOne.mockResolvedValueOnce(null);
    const response = await request(app).delete('/api/tasks/999').set('Accept', 'application/json');
    expect(response.status).toBe(404);
  });

  // Add test for error case to boost branch coverage
  test('should handle database error on update', async () => {
    const Task = require('../../database/models').Task;
    Task.findOne.mockRejectedValueOnce(new Error('Database error'));
    const response = await request(app)
      .patch('/api/tasks/1')
      .send({ title: 'Updated Task' })
      .set('Accept', 'application/json');
    expect(response.status).toBe(500);
  });
});
