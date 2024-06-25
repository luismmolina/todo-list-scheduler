import React, { useState } from "react";

const TaskList = ({
  tasks,
  deleteTask,
  completeTask,
  editTask,
  currentTime,
}) => {
  const [editingTask, setEditingTask] = useState(null);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#4CAF50"; // Green
      case "overdue":
        return "#F44336"; // Red
      case "ongoing":
        return "#2196F3"; // Blue
      case "deferred":
        return "#9C27B0"; // Purple
      default:
        return "#FFC107"; // Yellow for pending
    }
  };

  const getProgress = (task) => {
    if (task.status !== "ongoing") return 0;
    const elapsed = currentTime - task.startTime;
    const total = task.endTime - task.startTime;
    return Math.min(100, (elapsed / total) * 100);
  };

  const handleEditClick = (task) => {
    setEditingTask({ ...task });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    editTask(editingTask.id, editingTask);
    setEditingTask(null);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === "ongoing" && b.status !== "ongoing") return -1;
    if (b.status === "ongoing" && a.status !== "ongoing") return 1;
    return a.startTime - b.startTime;
  });

  return (
    <div>
      <h2>Tasks</h2>
      {sortedTasks.map((task) => {
        const statusColor = getStatusColor(task.status);
        const progress = getProgress(task);
        return (
          <div
            key={task.id}
            style={{
              border: `2px solid ${statusColor}`,
              padding: "10px",
              margin: "10px 0",
              borderRadius: "5px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {task.status === "ongoing" && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: `${progress}%`,
                  backgroundColor: "rgba(33, 150, 243, 0.3)",
                  transition: "width 1s linear",
                }}
              />
            )}
            {editingTask && editingTask.id === task.id ? (
              <form onSubmit={handleEditSubmit}>
                <input
                  name="title"
                  value={editingTask.title}
                  onChange={handleEditChange}
                />
                <input
                  name="duration"
                  type="number"
                  value={editingTask.duration}
                  onChange={handleEditChange}
                />
                <select
                  name="priority"
                  value={editingTask.priority}
                  onChange={handleEditChange}
                >
                  <option value="must do">Must do</option>
                  <option value="should do">Should do</option>
                  <option value="if time available">If time available</option>
                </select>
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditingTask(null)}>
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <span style={{ position: "relative", zIndex: 1 }}>
                  <strong>{task.title}</strong> - {task.duration} minutes -{" "}
                  {task.place} - {task.priority}
                  <br />
                  Scheduled: {formatDate(task.startTime)}{" "}
                  {formatTime(task.startTime)} - {formatTime(task.endTime)}
                  <br />
                  Status:{" "}
                  <span style={{ color: statusColor }}>{task.status}</span>
                  {task.status === "ongoing" &&
                    ` (${Math.round(progress)}% complete)`}
                </span>
                <div
                  style={{ marginTop: "10px", position: "relative", zIndex: 1 }}
                >
                  <button
                    onClick={() => completeTask(task.id)}
                    disabled={
                      task.status === "completed" || task.status === "deferred"
                    }
                  >
                    {task.status === "completed"
                      ? "Completed"
                      : "Mark as Complete"}
                  </button>
                  <button onClick={() => handleEditClick(task)}>Edit</button>
                  <button onClick={() => deleteTask(task.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
