import React from "react";
import styled from "styled-components";
import { format } from "date-fns";
import { Clock, Home, Briefcase, Star, CheckCircle } from "lucide-react";

const TaskItem = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  border-left: 4px solid
    ${(props) => {
      switch (props.status) {
        case "pending":
          return props.theme.colors.primary;
        case "ongoing":
          return props.theme.colors.secondary;
        case "overdue":
          return props.theme.colors.error;
        case "completed":
          return props.theme.colors.accent;
        default:
          return props.theme.colors.text;
      }
    }};
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

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: ${(props) => props.theme.colors.surface};
  margin-top: 0.5rem;
`;

const Progress = styled.div`
  width: ${(props) => props.progress}%;
  height: 100%;
  background-color: ${(props) => props.theme.colors.secondary};
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

  const calculateProgress = (task) => {
    if (task.status !== "ongoing") return 0;
    const elapsed = currentTime - task.startTime;
    const total = task.endTime - task.startTime;
    return Math.min(100, (elapsed / total) * 100);
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "must do":
        return <Star fill="gold" />;
      case "should do":
        return <Star fill="silver" />;
      case "if time available":
        return <Star fill="bronze" />;
      default:
        return null;
    }
  };

  const getPlaceIcon = (place) => {
    switch (place) {
      case "home":
        return <Home />;
      case "work":
        return <Briefcase />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h2>Scheduled Tasks</h2>
      {tasks.map((task) => (
        <TaskItem key={task.id} status={task.status}>
          <h3>{task.title}</h3>
          <p>
            {getPriorityIcon(task.priority)} {getPlaceIcon(task.place)}{" "}
            <Clock /> {task.duration} minutes
          </p>
          <p>Status: {task.status}</p>
          <p>Start Time: {formatTime(task.startTime)}</p>
          <p>End Time: {formatTime(task.endTime)}</p>
          {task.status === "ongoing" && (
            <ProgressBar>
              <Progress progress={calculateProgress(task)} />
            </ProgressBar>
          )}
          {task.status !== "completed" && (
            <>
              <Button onClick={() => completeTask(task.id)}>
                <CheckCircle /> Complete
              </Button>
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
