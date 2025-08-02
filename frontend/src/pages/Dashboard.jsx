import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Dashboard.css';

function Dashboard() {
  // Existing state variables (unchanged)
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isTimeLogModalOpen, setIsTimeLogModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    estimate: '',
    status: 'To do',
    description: '',
    loggedtime: '0',
  });
  const [updateTask, setUpdateTask] = useState({
    taskId: '',
    title: '',
    estimate: '',
    status: 'To do',
    description: '',
    loggedtime: '0',
    completed_at: '',
  });
  const [timeLogTask, setTimeLogTask] = useState({ taskId: '', loggedtime: 0 });
  const [clockAngle, setClockAngle] = useState(0);
  const [showNonCompletedOnly, setShowNonCompletedOnly] = useState(false);

  // New state variables for clock interaction
  const [isDragging, setIsDragging] = useState(false);
  const [timeToAdd, setTimeToAdd] = useState(0);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Existing useEffect for fetching tasks (unchanged)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(response.data || []);
      } catch (err) {
        setError('Failed to load tasks');
        console.error('Fetch tasks error:', err.response?.data || err.message);
      }
    };

    fetchTasks();
  }, [navigate]);

  // Draw clock function
  const drawClock = (angle) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw clock face
      ctx.beginPath();
      ctx.arc(100, 100, 90, 0, Math.PI * 2);
      ctx.strokeStyle = '#fff';
      ctx.stroke();
      ctx.closePath();

      // Draw center
      ctx.beginPath();
      ctx.arc(100, 100, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.closePath();

      // Draw needle
      const angleRad = (angle - 90) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(100, 100);
      ctx.lineTo(100 + 80 * Math.cos(angleRad), 100 + 80 * Math.sin(angleRad));
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#e50914';
      ctx.stroke();
      ctx.closePath();
    }
  };

  // Redraw clock when modal opens or angle changes
  useEffect(() => {
    if (isTimeLogModalOpen) {
      drawClock(clockAngle);
    }
  }, [isTimeLogModalOpen, clockAngle]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - 100; // Center at (100, 100)
        const y = e.clientY - rect.top - 100;
        const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
        const normalizedAngle = (angle + 360) % 360;
        setClockAngle(normalizedAngle);
        const minutesToAdd = Math.round((normalizedAngle / 360) * 60);
        setTimeToAdd(minutesToAdd);
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Attach event listeners to canvas when modal is open
  useEffect(() => {
    if (isTimeLogModalOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);

      return () => {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isTimeLogModalOpen, handleMouseDown, handleMouseMove, handleMouseUp]);

  // Existing handlers (unchanged except for handleTimeLog and handleTimeLogSubmit)
  const handleTaskClick = async (taskId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      setUpdateTask({
        taskId: response.data.task_id || taskId,
        title: response.data.title || '',
        estimate: response.data.estimate !== undefined ? String(response.data.estimate) : '',
        status: response.data.status || 'To do',
        description: response.data.description || '',
        loggedtime: response.data.loggedtime !== undefined ? String(response.data.loggedtime) : '0',
        completed_at: response.data.completed_at || '',
      });
      setIsUpdateModalOpen(true);
    } catch (err) {
      setError('Failed to load task for update');
      console.error('Fetch task for update error:', err.response?.data || err.message);
    }
  };

  const handleTimeLog = async (taskId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTimeLogTask({
        taskId: response.data.task_id || taskId,
        loggedtime: parseFloat(response.data.loggedtime) || 0,
      });
      setClockAngle(0);
      setTimeToAdd(0); // Reset time to add
      setIsTimeLogModalOpen(true);
    } catch (err) {
      setError('Failed to load task for time log');
      console.error('Fetch task for time log error:', err.response?.data || err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm(`Delete task with ID: ${taskId}?`)) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedTasks = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(updatedTasks.data || []);
      } catch (err) {
        setError('Failed to delete task');
        console.error('Delete task error:', err.response?.data || err.message);
      }
    }
  };

  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
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

  const closeTimeLogModal = () => {
    setIsTimeLogModalOpen(false);
    setTimeLogTask({ taskId: '', loggedtime: 0 });
    setClockAngle(0);
    setTimeToAdd(0);
  };

  const handleInputChange = (e, isUpdate = false) => {
    const { name, value } = e.target;
    if (isUpdate) {
      setUpdateTask((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewTask((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTimeLogSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      const payload = {
        logged_time: timeToAdd / 60, // Convert minutes to hours
      };
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/tasks/${timeLogTask.taskId}/time`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Task time logged:', response.data);
      const updatedTasks = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(updatedTasks.data || []);
      closeTimeLogModal();
    } catch (err) {
      setError('Failed to log time');
      console.error('Time log error:', err.response?.data || err.message);
    }
  };

  const handleSubmit = async (e, isUpdate = false) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const payload = isUpdate
        ? {
            taskId: updateTask.taskId,
            title: updateTask.title.trim(),
            estimate: updateTask.estimate === '' ? undefined : parseFloat(updateTask.estimate),
            status: updateTask.status,
            description: updateTask.description || undefined,
            loggedtime: updateTask.loggedtime === '' ? undefined : parseFloat(updateTask.loggedtime),
            completed_at: updateTask.status === 'Done' && !updateTask.completed_at ? new Date().toISOString().split('T')[0] : updateTask.completed_at || undefined,
          }
        : {
            title: newTask.title.trim(),
            estimate: newTask.estimate === '' ? undefined : parseFloat(newTask.estimate),
            status: newTask.status,
            description: newTask.description || undefined,
            loggedtime: newTask.loggedtime === '' ? undefined : parseFloat(newTask.loggedtime),
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
      {/* Existing dashboard header and task list (unchanged) */}
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
      <div className="filter-section">
        <label>
          <input
            type="checkbox"
            checked={showNonCompletedOnly}
            onChange={(e) => setShowNonCompletedOnly(e.target.checked)}
          />
          View only non-completed tasks
        </label>
      </div>
      <div className="tasks-list">
        {error && <p className="error-message">{error}</p>}
        {tasks.length > 0 ? (
          tasks
            .filter((task) => !showNonCompletedOnly || task.status !== 'Done')
            .map((task) => {
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
                      style={{ width: `${progress}%`, backgroundColor: task.status === 'Done' ? '#00cc00' : '#ff4444' }}
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
                    <span
                      className="action-icon"
                      onClick={() => handleTimeLog(task.task_id || task.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      +
                    </span>
                  </div>
                </div>
              );
            })
        ) : (
          <p className="no-tasks">No tasks yet for this user!</p>
        )}
      </div>

      {/* Existing modals (unchanged) */}
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
              <div Thalindra>
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

      {/* Updated Time Logging Modal */}
      {isTimeLogModalOpen && (
        <div className="modal-overlay" onClick={closeTimeLogModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Log Time for {tasks.find((t) => t.task_id === timeLogTask.taskId)?.title || 'Task'}</h2>
            <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto' }}>
              <canvas
                ref={canvasRef}
                id="clockCanvas"
                width="200"
                height="200"
                style={{ border: '1px solid #fff', cursor: 'pointer' }}
              ></canvas>
              <p style={{ color: '#ccc', textAlign: 'center', marginTop: '10px' }}>
                Time to add: {timeToAdd} minutes
              </p>
            </div>
            <button className="modal-close-button" onClick={handleTimeLogSubmit}>
              Submit Time
            </button>
            <button
              type="button"
              className="modal-close-button"
              onClick={closeTimeLogModal}
              style={{ marginLeft: '10px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;