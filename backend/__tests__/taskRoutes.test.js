const express = require('express');
const request = require('supertest');
const { morganMiddleware } = require('../logger');
const app = express();
app.use(express.json());
app.use(morganMiddleware);

// Import and use the routes
const routes = require('../routes');
app.use('/', routes);

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
        Object.assign(this, updates);
        return Promise.resolve(this);
      }),
      save: jest.fn().mockImplementation(function () {
        this.loggedtime = 1.5;
        return Promise.resolve(this);
      }),
      destroy: jest.fn().mockResolvedValue(true),
    };
    return Promise.resolve(taskInstance);
  });
  Task.destroy = jest.fn().mockResolvedValue(1); // Mock destroy for delete test

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

describe('Task Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { Task } = require('../../database/models');
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
    Task.destroy.mockResolvedValue(1); // Ensure destroy returns affected rows
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
    require('../../database/models').Task.destroy.mockResolvedValue(0); // No rows affected
    const response = await request(app).delete('/api/tasks/999').set('Accept', 'application/json');
    expect(response.status).toBe(404);
  });

  test('should handle database error on update', async () => {
    const { Task } = require('../../database/models');
    Task.findOne.mockRejectedValueOnce(new Error('Database error'));
    const response = await request(app)
      .patch('/api/tasks/1')
      .send({ title: 'Updated Task' })
      .set('Accept', 'application/json');
    expect(response.status).toBe(500);
  });
});