import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import axios from 'axios';

vi.mock('axios');

describe('Dashboard', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'mock-token-123');
    vi.resetAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('renders dashboard with tasks', async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        {
          task_id: 1,
          title: 'Test Task',
          estimate: 2.5,
          status: 'To do',
          description: 'A test task',
          loggedtime: 0,
        },
      ],
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('TaskFlix Dashboard')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Test Task')).toBeInTheDocument());
  });
});
