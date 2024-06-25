import React, { useState, useEffect } from "react";
import { triageTasks } from "./schedulingUtils";

const MoveTaskModal = ({
  task,
  onMove,
  onCancel,
  currentTasks,
  currentTime,
}) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date(currentTime.getTime() + 24 * 60 * 60 * 1000)
  ); // Next day
  const [previewTasks, setPreviewTasks] = useState([]);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    // Preview how the task would fit into the selected day
    const previewDate = new Date(selectedDate);
    previewDate.setHours(9, 0, 0, 0); // Start of day
    const tasksForDay = currentTasks.filter(
      (t) =>
        t.startTime && t.startTime.toDateString() === previewDate.toDateString()
    );
    const { scheduledTasks, deferredTasks, remainingTime } = triageTasks(
      [...tasksForDay, task],
      previewDate
    );
    setPreviewTasks([...scheduledTasks, ...deferredTasks]);
    setRemainingTime(remainingTime);
  }, [selectedDate, task, currentTasks]);

  const handleMove = () => {
    onMove(task.id, selectedDate);
  };

  return (
    <div className="modal">
      <h2>Move Task: {task.title}</h2>
      <input
        type="date"
        value={selectedDate.toISOString().split("T")[0]}
        onChange={(e) => setSelectedDate(new Date(e.target.value))}
        min={
          new Date(currentTime.getTime() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        }
      />
      <h3>Preview for {selectedDate.toDateString()}:</h3>
      <p>Remaining time: {Math.round(remainingTime)} minutes</p>
      {previewTasks.map((t, index) => (
        <div key={index} style={{ color: t.id === task.id ? "blue" : "black" }}>
          {t.title} - {t.duration} minutes - {t.status}
        </div>
      ))}
      <button onClick={handleMove}>Confirm Move</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default MoveTaskModal;
