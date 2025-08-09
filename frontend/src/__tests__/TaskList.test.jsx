import { render, screen, fireEvent } from '@testing-library/react';
import TaskList from '../components/TaskList';

const mockTasks = [
  { task_id: 1, title: 'Test Task', estimate: 2.5, status: 'To do', loggedtime: 0 },
];

describe('TaskList', () => {
  test('renders task list', () => {
    const mockTaskClick = vi.fn();
    const mockUpdateClick = vi.fn();
    const mockDeleteClick = vi.fn();
    const mockTimeLogClick = vi.fn();
    render(
      <TaskList
        tasks={mockTasks}
        showNonCompletedOnly={false}
        onTaskClick={mockTaskClick}
        onUpdateClick={mockUpdateClick}
        onDeleteClick={mockDeleteClick}
        onTimeLogClick={mockTimeLogClick}
      />
    );
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('filters non-completed tasks', () => {
    const completedTask = { task_id: 2, title: 'Done Task', status: 'Done', loggedtime: 0 };
    const mockTaskClick = vi.fn();
    const mockUpdateClick = vi.fn();
    const mockDeleteClick = vi.fn();
    const mockTimeLogClick = vi.fn();
    render(
      <TaskList
        tasks={[...mockTasks, completedTask]}
        showNonCompletedOnly={true}
        onTaskClick={mockTaskClick}
        onUpdateClick={mockUpdateClick}
        onDeleteClick={mockDeleteClick}
        onTimeLogClick={mockTimeLogClick}
      />
    );
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText('Done Task')).not.toBeInTheDocument();
  });

  test('triggers actions on click', () => {
    const mockTaskClick = vi.fn();
    const mockUpdateClick = vi.fn();
    const mockDeleteClick = vi.fn();
    const mockTimeLogClick = vi.fn();
    render(
      <TaskList
        tasks={mockTasks}
        showNonCompletedOnly={false}
        onTaskClick={mockTaskClick}
        onUpdateClick={mockUpdateClick}
        onDeleteClick={mockDeleteClick}
        onTimeLogClick={mockTimeLogClick}
      />
    );
    fireEvent.click(screen.getByText('Test Task'));
    expect(mockTaskClick).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getByText('✎'));
    expect(mockUpdateClick).toHaveBeenCalledWith(1);
  });
});
