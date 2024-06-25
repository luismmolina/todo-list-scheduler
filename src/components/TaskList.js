import React from "react";
import styled from "styled-components";
import { format } from "date-fns";

const TaskItem = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
`;

const Button = styled.button`
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.text};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-right: 0.5rem;
`;

const TaskList = ({
  tasks,
  deleteTask,
  completeTask,
  editTask,
  currentTime,
  openMoveTaskModal,
}) => {
  const formatTime = (date) => {
    return date ? format(date, "h:mm a") : "Not set";
  };

  return (
    <div>
      <h2>Scheduled Tasks</h2>
      {tasks.map((task) => (
        <TaskItem key={task.id}>
          <h3>{task.title}</h3>
          <p>Duration: {task.duration} minutes</p>
          <p>Priority: {task.priority}</p>
          <p>Place: {task.place}</p>
          <p>Status: {task.status}</p>
          <p>Start Time: {formatTime(task.startTime)}</p>
          <p>End Time: {formatTime(task.endTime)}</p>
          {task.status !== "completed" && (
            <>
              <Button onClick={() => completeTask(task.id)}>Complete</Button>
              <Button onClick={() => deleteTask(task.id)}>Delete</Button>
              <Button onClick={() => openMoveTaskModal(task)}>Move</Button>
              <Button
                onClick={() => {
                  const newDuration = prompt(
                    "Enter new duration (in minutes):",
                    task.duration
                  );
                  if (newDuration) {
                    editTask(task.id, { duration: parseInt(newDuration) });
                  }
                }}
              >
                Edit Duration
              </Button>
              <Button
                onClick={() => {
                  const newPriority = prompt(
                    "Enter new priority (must do, should do, if time available):",
                    task.priority
                  );
                  if (newPriority) {
                    editTask(task.id, { priority: newPriority });
                  }
                }}
              >
                Edit Priority
              </Button>
            </>
          )}
        </TaskItem>
      ))}
    </div>
  );
};

export default TaskList;
