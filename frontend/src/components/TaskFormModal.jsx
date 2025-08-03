const TaskFormModal = ({ isOpen, onClose, task, onSubmit, isUpdate, setTask }) => {
  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const payload = {
      taskId: task.taskId,
      title: task.title.trim(),
      estimate: task.estimate === '' ? undefined : parseFloat(task.estimate),
      status: task.status,
      description: task.description || undefined,
      loggedtime: task.loggedtime === '' ? undefined : parseFloat(task.loggedtime),
      completed_at:
        task.status === 'Done' && !task.completed_at && isUpdate
          ? new Date().toISOString().split('T')[0]
          : task.completed_at || undefined,
    };
    onSubmit(payload, isUpdate);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{isUpdate ? 'Edit Task' : 'Create New Task'}</h2>
        <div>
          <label>
            Title:
            <input
              type="text"
              name="title"
              value={task.title}
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
              value={task.estimate}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              required={!isUpdate}
            />
          </label>
        </div>
        <div>
          <label>
            Status:
            <select name="status" value={task.status} onChange={handleInputChange}>
              <option value="To do">To do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            Description:
            <textarea name="description" value={task.description} onChange={handleInputChange} />
          </label>
        </div>
        {isUpdate && (
          <div>
            <label>
              Completed At:
              <input
                type="date"
                name="completed_at"
                value={task.completed_at}
                onChange={handleInputChange}
              />
            </label>
          </div>
        )}
        <div>
          <label>
            Logged Time (hours):
            <input
              type="number"
              name="loggedtime"
              value={task.loggedtime}
              onChange={handleInputChange}
              step="0.1"
              min="0"
            />
          </label>
        </div>
        <div>
          <button type="button" className="modal-close-button" onClick={handleFormSubmit}>
            {isUpdate ? 'Update Task' : 'Create Task'}
          </button>
          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            style={{ marginLeft: '10px' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskFormModal;
