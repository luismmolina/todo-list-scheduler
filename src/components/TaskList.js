import React, { useState } from "react";
import styled from "styled-components";
import { format } from "date-fns";
import {
  Clock,
  Home,
  Briefcase,
  Star,
  MoreVertical,
  Check,
  Trash2,
  Edit,
  Move,
} from "lucide-react";
import {
  SwipeableList,
  SwipeableListItem,
} from "@sandstreamdev/react-swipeable-list";
import "@sandstreamdev/react-swipeable-list/dist/styles.css";

const TaskItem = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  padding: 1rem;
  margin-bottom: 0.5rem;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TaskInfo = styled.div`
  flex: 1;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.text};
  cursor: pointer;
  padding: 0.5rem;
  margin-left: 0.5rem;
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

const MoreMenu = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const MenuItem = styled.button`
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  text-align: left;
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.text};
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.colors.primary};
  }
`;

const TaskList = ({
  tasks,
  deleteTask,
  completeTask,
  editTask,
  currentTime,
  openMoveTaskModal,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);

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

  const handleMoreClick = (taskId) => {
    setOpenMenuId(openMenuId === taskId ? null : taskId);
  };

  const swipeRightOptions = (task) => ({
    content: (
      <div
        style={{
          background: "green",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 1rem",
        }}
      >
        <Check color="white" />
      </div>
    ),
    action: () => completeTask(task.id),
  });

  const swipeLeftOptions = (task) => ({
    content: (
      <div
        style={{
          background: "red",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 1rem",
        }}
      >
        <Trash2 color="white" />
      </div>
    ),
    action: () => deleteTask(task.id),
  });

  return (
    <SwipeableList>
      {tasks.map((task) => (
        <SwipeableListItem
          key={task.id}
          swipeRight={
            task.status !== "completed" ? swipeRightOptions(task) : null
          }
          swipeLeft={swipeLeftOptions(task)}
        >
          <TaskItem status={task.status}>
            <TaskInfo>
              <h3>{task.title}</h3>
              <p>
                {getPriorityIcon(task.priority)} {getPlaceIcon(task.place)}{" "}
                <Clock /> {task.duration} minutes
              </p>
              <p>Status: {task.status}</p>
              <p>
                Start: {formatTime(task.startTime)} | End:{" "}
                {formatTime(task.endTime)}
              </p>
              {task.status === "ongoing" && (
                <ProgressBar>
                  <Progress progress={calculateProgress(task)} />
                </ProgressBar>
              )}
            </TaskInfo>
            {task.status !== "completed" && (
              <div style={{ position: "relative" }}>
                <IconButton onClick={() => handleMoreClick(task.id)}>
                  <MoreVertical />
                </IconButton>
                {openMenuId === task.id && (
                  <MoreMenu>
                    <MenuItem
                      onClick={() => {
                        editTask(task.id, {
                          duration: prompt(
                            "Enter new duration (in minutes):",
                            task.duration
                          ),
                        });
                        setOpenMenuId(null);
                      }}
                    >
                      <Edit size={16} /> Edit Duration
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        editTask(task.id, {
                          priority: prompt(
                            "Enter new priority:",
                            task.priority
                          ),
                        });
                        setOpenMenuId(null);
                      }}
                    >
                      <Star size={16} /> Edit Priority
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        openMoveTaskModal(task);
                        setOpenMenuId(null);
                      }}
                    >
                      <Move size={16} /> Move Task
                    </MenuItem>
                  </MoreMenu>
                )}
              </div>
            )}
          </TaskItem>
        </SwipeableListItem>
      ))}
    </SwipeableList>
  );
};

export default TaskList;
