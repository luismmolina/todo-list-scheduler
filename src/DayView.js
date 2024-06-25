import React from "react";

const DayView = ({
  tasks,
  selectedDate,
  setSelectedDate,
  deleteTask,
  completeTask,
  editTask,
  currentTime,
}) => {
  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const tasksForSelectedDay = tasks.filter((task) =>
    isSameDay(task.startTime, selectedDate)
  );

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  return (
    <div>
      <h3>
        <button onClick={handlePrevDay}>&lt;</button>
        {selectedDate.toDateString()}
        <button onClick={handleNextDay}>&gt;</button>
      </h3>
      {tasksForSelectedDay.length === 0 ? (
        <p>No tasks scheduled for this day.</p>
      ) : (
        tasksForSelectedDay.map((task) => (
          <div key={task.id}>
            <span>
              {task.title} - {formatTime(task.startTime)} to{" "}
              {formatTime(task.endTime)}
            </span>
            <button onClick={() => completeTask(task.id)}>Complete</button>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
};

export default DayView;
