const TaskList = ({
  tasks,
  showNonCompletedOnly,
  onTaskClick,
  onUpdateClick,
  onDeleteClick,
  onTimeLogClick,
}) => {
  const filteredTasks = showNonCompletedOnly
    ? tasks.filter((task) => task.status !== 'Done')
    : tasks;

  return (
    <div className="tasks-list">
      {filteredTasks.length > 0 ? (
        filteredTasks.map((task) => {
          const progress = task.estimate
            ? Math.min(100, (parseFloat(task.loggedtime) / parseFloat(task.estimate)) * 100)
            : 0;
          const isOverworked =
            task.estimate && parseFloat(task.loggedtime) > parseFloat(task.estimate);
          const isEfficientlyCompleted = 
            task.status === 'Done' && 
            task.estimate && 
            parseFloat(task.loggedtime) < parseFloat(task.estimate);

          return (
            <div key={task.task_id || task.id} className="task-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span
                  className={`task-title ${task.status === 'Done' ? 'task-done' : ''}`}
                  onClick={() => onTaskClick(task.task_id || task.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {task.title || 'Untitled'}
                </span>
                {isEfficientlyCompleted && (
                  <span
                    className="celebration-icon"
                    title="Task completed ahead of schedule!"
                  >
                    🎉
                  </span>
                )}
              </div>
              <div className="task-progress">
                <div
                  className="progress-bar"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: task.status === 'Done' ? '#00cc00' : '#ff4444',
                  }}
                ></div>
              </div>
              {isOverworked && (
                <span
                  className="warning-triangle"
                  title="You worked more than expected on this task"
                >
                  ⚠
                </span>
              )}
              <div className="task-actions">
                <span
                  className="action-icon"
                  onClick={() => onUpdateClick(task.task_id || task.id)}
                  style={{ cursor: 'pointer' }}
                >
                  ✎
                </span>
                <span
                  className="action-icon"
                  onClick={() => onDeleteClick(task.task_id || task.id)}
                  style={{ cursor: 'pointer' }}
                >
                  ✖
                </span>
                <span
                  className="action-icon"
                  onClick={() => onTimeLogClick(task.task_id || task.id)}
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
  );
};

export default TaskList;
