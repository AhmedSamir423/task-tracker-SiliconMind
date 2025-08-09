import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import TaskList from '../components/TaskList';
import TaskDetailsModal from '../components/TaskDetailsModal';
import TaskFormModal from '../components/TaskFormModal';
import TimeLogModal from '../components/TimeLogModal';

import './Dashboard.css';

function Dashboard() {
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
  const [showNonCompletedOnly, setShowNonCompletedOnly] = useState(false);

  const navigate = useNavigate();

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

  const handleCreateTask = () => setIsCreateModalOpen(true);

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
    setUpdateTask({
      taskId: '',
      title: '',
      estimate: '',
      status: 'To do',
      description: '',
      loggedtime: '0',
      completed_at: '',
    });
  };

  const closeTimeLogModal = () => {
    setIsTimeLogModalOpen(false);
    setTimeLogTask({ taskId: '', loggedtime: 0 });
  };

  const handleTimeLogSubmit = async (timeToAddHours) => {
    const token = localStorage.getItem('token');
    try {
      const payload = { logged_time: timeToAddHours };
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/tasks/${timeLogTask.taskId}/time`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  const handleSubmit = async (taskData, isUpdate) => {
    const token = localStorage.getItem('token');
    try {
      const url = isUpdate
        ? `${import.meta.env.VITE_API_URL}/api/tasks/${taskData.taskId}`
        : `${import.meta.env.VITE_API_URL}/api/tasks`;
      const method = isUpdate ? 'patch' : 'post';
      await axios[method](url, taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedTasks = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(updatedTasks.data || []);
      isUpdate ? closeUpdateModal() : closeCreateModal();
    } catch (err) {
      setError(`Failed to ${isUpdate ? 'update' : 'create'} task`);
      console.error(
        `${isUpdate ? 'Update' : 'Create'} task error:`,
        err.response?.data || err.message
      );
    }
  };

  const userId = getUserId();


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
      {error && <p className="error-message">{error}</p>}
      <TaskList
        tasks={tasks}
        showNonCompletedOnly={showNonCompletedOnly}
        onTaskClick={handleTaskClick}
        onUpdateClick={handleUpdateTask}
        onDeleteClick={handleDeleteTask}
        onTimeLogClick={handleTimeLog}
      />
      {isModalOpen && (
        <TaskDetailsModal isOpen={isModalOpen} onClose={closeModal} task={selectedTask} />
      )}
      {isCreateModalOpen && (
        <TaskFormModal
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          task={newTask}
          onSubmit={handleSubmit}
          isUpdate={false}
          setTask={setNewTask}
        />
      )}
      {isUpdateModalOpen && (
        <TaskFormModal
          isOpen={isUpdateModalOpen}
          onClose={closeUpdateModal}
          task={updateTask}
          onSubmit={handleSubmit}
          isUpdate={true}
          setTask={setUpdateTask}
        />
      )}
      {isTimeLogModalOpen && (
        <TimeLogModal
          isOpen={isTimeLogModalOpen}
          onClose={closeTimeLogModal}
          taskId={timeLogTask.taskId}
          onSubmit={handleTimeLogSubmit}
          taskTitle={tasks.find((t) => t.task_id === timeLogTask.taskId)?.title || 'Task'}
        />

      )}
    </div>
  );
}

export default Dashboard;

