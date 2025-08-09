import { rest } from 'msw';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const handlers = [
  rest.post(`${API_URL}/api/auth/signup`, (req, res, ctx) => {
    const { email } = req.body;
    if (email === 'exists@example.com') {
      return res(ctx.status(409), ctx.json({ error: 'Email already exists' }));
    }
    return res(ctx.status(201), ctx.json({ message: 'User created' }));
  }),

  rest.post(`${API_URL}/api/auth/login`, (req, res, ctx) => {
    const { email, password } = req.body;
    if (email === 'user@example.com' && password === 'password123') {
      return res(ctx.status(200), ctx.json({ token: 'mock-token-123' }));
    }
    return res(ctx.status(401), ctx.json({ error: 'Invalid credentials' }));
  }),

  rest.get(`${API_URL}/api/tasks`, (req, res, ctx) => {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (token === 'mock-token-123') {
      return res(
        ctx.status(200),
        ctx.json([
          {
            task_id: 1,
            title: 'Test Task',
            estimate: 2.5,
            status: 'To do',
            description: 'A test task',
            loggedtime: 0,
          },
        ])
      );
    }
    return res(ctx.status(401));
  }),

  rest.get(`${API_URL}/api/tasks/:id`, (req, res, ctx) => {
    const { id } = req.params;
    if (id === '1') {
      return res(
        ctx.status(200),
        ctx.json({
          task_id: 1,
          title: 'Test Task',
          estimate: 2.5,
          status: 'To do',
          description: 'A test task',
          loggedtime: 0,
        })
      );
    }
    return res(ctx.status(404));
  }),

  rest.post(`${API_URL}/api/tasks`, (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ task_id: 2, ...req.body }));
  }),

  rest.patch(`${API_URL}/api/tasks/:id`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ task_id: req.params.id, ...req.body }));
  }),

  rest.patch(`${API_URL}/api/tasks/:id/time`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ task_id: req.params.id, loggedtime: 1.5 }));
  }),

  rest.delete(`${API_URL}/api/tasks/:id`, (req, res, ctx) => {
    return res(ctx.status(204));
  }),
];
