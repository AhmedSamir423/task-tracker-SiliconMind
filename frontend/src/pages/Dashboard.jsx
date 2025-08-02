import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Dashboard.css';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // For task details modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // For create task modal
  const [newTask, setNewTask] = useState({
    title: '',
    estimate: '',
    status: 'To do',
    description: '',
    loggedtime: '0', // Default to 0
  }); // State for new task form, removed completed_at
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    if (!token) {
      console.log('No token, redirecting to login');
      navigate('/login');
      return;
    }

    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('API response for tasks:', response.data);
        setTasks(response.data || []);
      } catch (err) {
        setError('Failed to load tasks');
        console.error('Fetch tasks error:', err.response?.data || err.message);
      }
    };

    fetchTasks();
  }, [navigate]);

  const handleTaskClick = async (taskId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('API response for task:', response.data);
      setSelectedTask(response.data);
      setIsModalOpen(true);
    } catch (err) {
      setError('Failed to load task details');
      console.error('Fetch task error:', err.response?.data || err.message);
    }
  };

  const handleCreateTask = () => {
    setIsCreateModalOpen(true);
  };

  const handleUpdateTask = (taskId) => alert(`Update task with ID: ${taskId}`);
  const handleDeleteTask = (taskId) => {
    if (window.confirm(`Delete task with ID: ${taskId}?`)) alert(`Task ID: ${taskId} deleted`);
  };

  const getUserId = () => {
    const token = localStorage.getItem('token');
    console.log('Attempting to decode token:', token);
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('Decoded token payload:', decoded);
        return decoded.userId || decoded.user_id || 'Unknown';
      } catch (err) {
        console.error('JWT decode error:', err.message);
        return 'Unknown';
      }
    }
    return 'Unknown';
  };

  const userId = getUserId();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setNewTask({ title: '', estimate: '', status: 'To do', description: '', loggedtime: '0' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const payload = {
        title: newTask.title,
        estimate: parseFloat(newTask.estimate) || 0,
        status: newTask.status,
        description: newTask.description || undefined, // Optional, send undefined if empty
        loggedtime: parseFloat(newTask.loggedtime) || 0, // Default to 0
      };
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/tasks`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Task created:', response.data);
      setTasks((prev) => [...prev, response.data]);
      closeCreateModal();
    } catch (err) {
      setError('Failed to create task');
      console.error('Create task error:', err.response?.data || err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">TaskFlix Dashboard</h1>
          <p className="welcome-message">Welcome, {userId}</p>
        </div>
        <div>
          <button className="create-button" onClick={handleCreateTask}>
            +
          </button>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      <div className="tasks-list">
        {error && <p className="error-message">{error}</p>}
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.task_id || task.id} className="task-item">
              <span
                className="task-title"
                onClick={() => handleTaskClick(task.task_id || task.id)}
                style={{ cursor: 'pointer' }}
              >
                {task.title || 'Untitled'}
              </span>
              <div className="task-actions">
                <span
                  className="action-icon"
                  onClick={() => handleUpdateTask(task.task_id || task.id)}
                  style={{ cursor: 'pointer' }}
                >
                  ✎
                </span>
                <span
                  className="action-icon"
                  onClick={() => handleDeleteTask(task.task_id || task.id)}
                  style={{ cursor: 'pointer' }}
                >
                  ✎
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="no-tasks">No tasks yet for this user!</p>
        )}
      </div>
      {isModalOpen && selectedTask && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedTask.title || 'Untitled Task'}</h2>
            <p>
              <strong>Description:</strong> {selectedTask.description || 'No description'}
            </p>
            <p>
              <strong>Estimate:</strong> {selectedTask.estimate || 'N/A'} hours
            </p>
            <p>
              <strong>Status:</strong> {selectedTask.status || 'N/A'}
            </p>
            <p>
              <strong>Completed At:</strong>{' '}
              {selectedTask.completed_at
                ? new Date(selectedTask.completed_at).toLocaleDateString()
                : 'N/A'}
            </p>
            <p>
              <strong>Logged Time:</strong> {selectedTask.loggedtime || 'N/A'} hours
            </p>
            <button className="modal-close-button" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Task</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label>
                  Title:
                  <input
                    type="text"
                    name="title"
                    value={newTask.title}
                    onChange={handleInputChange}
                    required
                  />
                </label>
              </div>
              <div>
                <label>
                  Estimate (hours):
                  <input
                    type="number"
                    name="estimate"
                    value={newTask.estimate}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0"
                    required
                  />
                </label>
              </div>
              <div>
                <label>
                  Status:
                  <select name="status" value={newTask.status} onChange={handleInputChange}>
                    <option value="To do">To do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </label>
              </div>
              <div>
                <label>
                  Description:
                  <textarea
                    name="description"
                    value={newTask.description}
                    onChange={handleInputChange}
                  />
                </label>
              </div>
              <div>
                <label>
                  Logged Time (hours):
                  <input
                    type="number"
                    name="loggedtime"
                    value={newTask.loggedtime}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0"
                  />
                </label>
              </div>
              <div>
                <button type="submit" className="modal-close-button">
                  Create Task
                </button>
                <button
                  type="button"
                  className="modal-close-button"
                  onClick={closeCreateModal}
                  style={{ marginLeft: '10px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;