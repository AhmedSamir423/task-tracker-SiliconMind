const TaskDetailsModal = ({ isOpen, onClose, task }) => {
  if (!isOpen || !task) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{task.title || 'Untitled Task'}</h2>
        <p>
          <strong>Description:</strong> {task.description || 'No description'}
        </p>
        <p>
          <strong>Estimate:</strong> {task.estimate || 'N/A'} hours
        </p>
        <p>
          <strong>Status:</strong> {task.status || 'N/A'}
        </p>
        <p>
          <strong>Completed At:</strong>{' '}
          {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'N/A'}
        </p>
        <p>
          <strong>Logged Time:</strong> {task.loggedtime || 'N/A'} hours
        </p>
        <button className="modal-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
