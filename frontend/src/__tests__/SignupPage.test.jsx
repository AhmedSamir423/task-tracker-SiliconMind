import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignupPage from '../pages/SignupPage';
import axios from 'axios';

vi.mock('axios');

describe('SignupPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('renders signup form', () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  test('shows error with existing email', async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 409, data: { message: 'Email already exists' } },
    });

    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'exists@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => expect(screen.getByText('Email already exists')).toBeInTheDocument());
  });
});
