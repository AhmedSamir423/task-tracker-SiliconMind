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
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // For update task modal
  const [newTask, setNewTask] = useState({
    title: '',
    estimate: '',
    status: 'To do',
    description: '',
    loggedtime: '0',
  }); // State for new task form
  const [updateTask, setUpdateTask] = useState({
    taskId: '',
    title: '',
    estimate: '',
    status: 'To do',
    description: '',
    loggedtime: '0',
    completed_at: '',
  }); // State for update task form
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

  const handleUpdateTask = async (taskId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('API response for task to update:', response.data);
      setUpdateTask({
        taskId: response.data.task_id,
        title: response.data.title || '',
        estimate: response.data.estimate || '',
        status: response.data.status || 'To do',
        description: response.data.description || '',
        loggedtime: response.data.loggedtime || '0',
        completed_at: response.data.completed_at || '',
      });
      setIsUpdateModalOpen(true);
    } catch (err) {
      setError('Failed to load task for update');
      console.error('Fetch task for update error:', err.response?.data || err.message);
    }
  };

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

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setUpdateTask({ taskId: '', title: '', estimate: '', status: 'To do', description: '', loggedtime: '0', completed_at: '' });
  };

  const handleInputChange = (e, isUpdate = false) => {
    const { name, value } = e.target;
    if (isUpdate) {
      setUpdateTask((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewTask((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e, isUpdate = false) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const payload = isUpdate
        ? {
            taskId: updateTask.taskId,
            title: updateTask.title,
            estimate: parseFloat(updateTask.estimate) || 0,
            status: updateTask.status,
            description: updateTask.description || undefined,
            loggedtime: parseFloat(updateTask.loggedtime) || 0,
            completed_at: updateTask.completed_at || null,
          }
        : {
            title: newTask.title,
            estimate: parseFloat(newTask.estimate) || 0,
            status: newTask.status,
            description: newTask.description || undefined,
            loggedtime: parseFloat(newTask.loggedtime) || 0,
          };
      const url = isUpdate
        ? `${import.meta.env.VITE_API_URL}/api/tasks/${updateTask.taskId}`
        : `${import.meta.env.VITE_API_URL}/api/tasks`;
      const method = isUpdate ? 'patch' : 'post';
      const response = await axios[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`${isUpdate ? 'Task updated' : 'Task created'}:`, response.data);
      const updatedTasks = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(updatedTasks.data || []);
      isUpdate ? closeUpdateModal() : closeCreateModal();
    } catch (err) {
      setError(`Failed to ${isUpdate ? 'update' : 'create'} task`);
      console.error(`${isUpdate ? 'Update' : 'Create'} task error:`, err.response?.data || err.message);
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
          tasks.map((task) => {
            const progress = task.estimate
              ? Math.min(100, (parseFloat(task.loggedtime) / parseFloat(task.estimate)) * 100)
              : 0;
            const isOverworked = task.estimate && parseFloat(task.loggedtime) > parseFloat(task.estimate);

            return (
              <div key={task.task_id || task.id} className="task-item">
                <span
                  className={`task-title ${task.status === 'Done' ? 'task-done' : ''}`}
                  onClick={() => handleTaskClick(task.task_id || task.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {task.title || 'Untitled'}
                </span>
                <div className="task-progress">
                  <div
                    className="progress-bar"
                    style={{ width: `${progress}%`, backgroundColor: task.status === 'Done' ? '#e50914' : '#00cc00' }}
                  ></div>
                </div>
                {isOverworked && (
                  <span className="warning-triangle" title="You worked more than expected on this task">
                    ⚠
                  </span>
                )}
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
                    ✖
                  </span>
                </div>
              </div>
            );
          })
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
            <form onSubmit={(e) => handleSubmit(e, false)}>
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
      {isUpdateModalOpen && (
        <div className="modal-overlay" onClick={closeUpdateModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Task</h2>
            <form onSubmit={(e) => handleSubmit(e, true)}>
              <div>
                <label>
                  Title:
                  <input
                    type="text"
                    name="title"
                    value={updateTask.title}
                    onChange={(e) => handleInputChange(e, true)}
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
                    value={updateTask.estimate}
                    onChange={(e) => handleInputChange(e, true)}
                    step="0.1"
                    min="0"
                    required
                  />
                </label>
              </div>
              <div>
                <label>
                  Status:
                  <select
                    name="status"
                    value={updateTask.status}
                    onChange={(e) => handleInputChange(e, true)}
                  >
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
                    value={updateTask.description}
                    onChange={(e) => handleInputChange(e, true)}
                  />
                </label>
              </div>
              <div>
                <label>
                  Completed At:
                  <input
                    type="date"
                    name="completed_at"
                    value={updateTask.completed_at}
                    onChange={(e) => handleInputChange(e, true)}
                  />
                </label>
              </div>
              <div>
                <label>
                  Logged Time (hours):
                  <input
                    type="number"
                    name="loggedtime"
                    value={updateTask.loggedtime}
                    onChange={(e) => handleInputChange(e, true)}
                    step="0.1"
                    min="0"
                  />
                </label>
              </div>
              <div>
                <button type="submit" className="modal-close-button">
                  Update Task
                </button>
                <button
                  type="button"
                  className="modal-close-button"
                  onClick={closeUpdateModal}
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