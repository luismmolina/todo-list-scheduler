import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { format } from "date-fns";
import {
  Clock,
  Home,
  Briefcase,
  Star,
  Check,
  Trash2,
  Edit,
  Move,
  X,
} from "lucide-react";
import {
  SwipeableList,
  SwipeableListItem,
} from "@sandstreamdev/react-swipeable-list";
import "@sandstreamdev/react-swipeable-list/dist/styles.css";
import {
  calculateTaskProgress,
  getPriorityLevel,
  formatTaskDuration,
  getTaskStatusColor,
} from "./taskUtils";

const TaskItem = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  border-left: 4px solid
    ${(props) => getTaskStatusColor(props.task, props.theme, props.currentTime)};
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

const BottomSheet = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${(props) => props.theme.colors.surface};
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 1rem;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transform: translateY(${(props) => (props.isOpen ? "0" : "100%")});
  transition: transform 0.3s ease-in-out;
`;

const BottomSheetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background-color: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  text-align: left;

  &:hover {
    background-color: ${(props) => props.theme.colors.primary};
  }
`;

const ActionText = styled.span`
  margin-left: 1rem;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${(props) => (props.isOpen ? "block" : "none")};
`;

const SectionHeader = styled.h2`
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: ${(props) => props.theme.colors.text};
`;

const TaskList = ({
  tasks,
  deleteTask,
  completeTask,
  editTask,
  currentTime,
  openMoveTaskModal,
}) => {
  const [selectedTask, setSelectedTask] = useState(null);

  const { activeTasks, completedTasks } = useMemo(() => {
    const active = tasks
      .filter((task) => task.status !== "completed")
      .sort((a, b) => {
        if (a.status === "ongoing" && b.status !== "ongoing") return -1;
        if (b.status === "ongoing" && a.status !== "ongoing") return 1;
        return (
          (a.startTime || new Date(9999, 11, 31)) -
          (b.startTime || new Date(9999, 11, 31))
        );
      });
    const completed = tasks
      .filter((task) => task.status === "completed")
      .sort((a, b) => b.endTime - a.endTime);
    return { activeTasks: active, completedTasks: completed };
  }, [tasks]);

  const formatTime = (date) => {
    return date ? format(date, "h:mm a") : "Not set";
  };

  const getPriorityIcon = (priority) => {
    const level = getPriorityLevel(priority);
    const colors = ["#CD7F32", "#C0C0C0", "#FFD700"];
    return <Star fill={colors[level - 1]} />;
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

  const handleMoreClick = (task, event) => {
    event.stopPropagation();
    setSelectedTask(task);
  };

  const closeBottomSheet = () => {
    setSelectedTask(null);
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

  const renderTaskList = (taskList, isCompleted = false) => (
    <SwipeableList>
      {taskList.map((task) => (
        <SwipeableListItem
          key={task.id}
          swipeRight={!isCompleted ? swipeRightOptions(task) : null}
          swipeLeft={swipeLeftOptions(task)}
        >
          <TaskItem task={task} currentTime={currentTime}>
            <TaskInfo>
              <h3>{task.title}</h3>
              <p>
                {getPriorityIcon(task.priority)} {getPlaceIcon(task.place)}{" "}
                <Clock /> {formatTaskDuration(task.duration)}
              </p>
              <p>Status: {task.status}</p>
              <p>
                Start: {formatTime(task.startTime)} | End:{" "}
                {formatTime(task.endTime)}
              </p>
              {task.status === "ongoing" && (
                <ProgressBar>
                  <Progress
                    progress={calculateTaskProgress(task, currentTime)}
                  />
                </ProgressBar>
              )}
            </TaskInfo>
            {!isCompleted && (
              <IconButton onClick={(e) => handleMoreClick(task, e)}>
                <Edit />
              </IconButton>
            )}
          </TaskItem>
        </SwipeableListItem>
      ))}
    </SwipeableList>
  );

  return (
    <>
      <SectionHeader>Active Tasks</SectionHeader>
      {renderTaskList(activeTasks)}

      <SectionHeader>Completed Tasks</SectionHeader>
      {renderTaskList(completedTasks, true)}

      <Overlay isOpen={selectedTask !== null} onClick={closeBottomSheet} />
      <BottomSheet isOpen={selectedTask !== null}>
        {selectedTask && (
          <>
            <BottomSheetHeader>
              <h3>{selectedTask.title}</h3>
              <IconButton onClick={closeBottomSheet}>
                <X />
              </IconButton>
            </BottomSheetHeader>
            <ActionButton
              onClick={() => {
                completeTask(selectedTask.id);
                closeBottomSheet();
              }}
            >
              <Check />
              <ActionText>Complete</ActionText>
            </ActionButton>
            <ActionButton
              onClick={() => {
                deleteTask(selectedTask.id);
                closeBottomSheet();
              }}
            >
              <Trash2 />
              <ActionText>Delete</ActionText>
            </ActionButton>
            <ActionButton
              onClick={() => {
                const newDuration = prompt(
                  "Enter new duration (in minutes):",
                  selectedTask.duration
                );
                if (newDuration && !isNaN(newDuration)) {
                  editTask(selectedTask.id, {
                    duration: parseInt(newDuration, 10),
                  });
                }
                closeBottomSheet();
              }}
            >
              <Edit />
              <ActionText>Edit Duration</ActionText>
            </ActionButton>
            <ActionButton
              onClick={() => {
                const newPriority = prompt(
                  "Enter new priority (must do, should do, if time available):",
                  selectedTask.priority
                );
                if (newPriority) {
                  editTask(selectedTask.id, { priority: newPriority });
                }
                closeBottomSheet();
              }}
            >
              <Star />
              <ActionText>Edit Priority</ActionText>
            </ActionButton>
            <ActionButton
              onClick={() => {
                openMoveTaskModal(selectedTask);
                closeBottomSheet();
              }}
            >
              <Move />
              <ActionText>Move Task</ActionText>
            </ActionButton>
          </>
        )}
      </BottomSheet>
    </>
  );
};

export default TaskList;
