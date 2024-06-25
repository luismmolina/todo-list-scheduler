import React, { useState, useEffect, useCallback } from "react";
import { ThemeProvider } from "styled-components";
import {
  triageTasks,
  adjustSchedule,
  moveTaskToNextDay,
  suggestRescheduling,
  getTimeBlockSummary,
} from "./components/schedulingUtils";
import { theme } from "./styles/theme";
import GlobalStyle from "./styles/globalStyles";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Content from "./components/Content";
import { Modal, ModalContent } from "./components/Modal";
import AddTaskForm from "./components/AddTaskForm";
import MoveTaskModal from "./components/MoveTaskModal";
import BottomNavigation from "./components/BottomNavigation";
import TaskInsights from "./components/TaskInsights";

import styled from "styled-components";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  @media (max-width: 768px) {
    height: auto;
  }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  @media (min-width: 769px) {
    flex-direction: row;
  }
`;

const FAB = styled.button`
  position: fixed;
  bottom: 70px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.text};
  border: none;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;
`;

const LOCAL_STORAGE_KEY = "todoListSchedulerTasks";

const App = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasksString = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedTasksString) {
      try {
        const savedTasks = JSON.parse(savedTasksString);
        const parsedTasks = savedTasks.map((task) => ({
          ...task,
          startTime: task.startTime ? new Date(task.startTime) : null,
          endTime: task.endTime ? new Date(task.endTime) : null,
        }));
        return { scheduled: parsedTasks, deferred: [] };
      } catch (error) {
        console.error("Error parsing initial saved tasks:", error);
        return { scheduled: [], deferred: [] };
      }
    }
    return { scheduled: [], deferred: [] };
  });

  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [viewMode, setViewMode] = useState("list");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [remainingTime, setRemainingTime] = useState(0);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isMovingTask, setIsMovingTask] = useState(false);
  const [taskToMove, setTaskToMove] = useState(null);
  const [reschedulingSuggestions, setReschedulingSuggestions] = useState([]);
  const [timeBlockSummary, setTimeBlockSummary] = useState([]);

  const updateTaskStatuses = useCallback((time, currentTasks) => {
    const { scheduledTasks, deferredTasks, remainingTime } = triageTasks(
      currentTasks,
      time
    );
    setTasks({ scheduled: scheduledTasks, deferred: deferredTasks });
    setRemainingTime(remainingTime);
  }, []);

  useEffect(() => {
    updateTaskStatuses(currentTime, tasks.scheduled);
  }, [updateTaskStatuses, currentTime, tasks.scheduled]);

  useEffect(() => {
    const tasksToSave = [...tasks.scheduled, ...tasks.deferred];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasksToSave));
  }, [tasks]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime((prevTime) => {
        const newTime = new Date(prevTime.getTime() + 60000);
        updateTaskStatuses(newTime, [...tasks.scheduled, ...tasks.deferred]);
        return newTime;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, [updateTaskStatuses, tasks]);

  useEffect(() => {
    const updateInsights = () => {
      const allTasks = [...tasks.scheduled, ...tasks.deferred];
      const suggestions = suggestRescheduling(allTasks, currentTime);
      setReschedulingSuggestions(suggestions);
      const summary = getTimeBlockSummary(currentTime);
      setTimeBlockSummary(summary);
    };

    updateInsights();
    const timer = setInterval(updateInsights, 5 * 60 * 1000); // Update every 5 minutes

    return () => clearInterval(timer);
  }, [currentTime, tasks]);

  const addTask = useCallback(
    (task) => {
      updateTaskStatuses(currentTime, [
        ...tasks.scheduled,
        ...tasks.deferred,
        task,
      ]);
      setIsAddingTask(false);
    },
    [currentTime, tasks, updateTaskStatuses]
  );

  const deleteTask = useCallback(
    (taskId) => {
      const updatedTasks = [...tasks.scheduled, ...tasks.deferred].filter(
        (task) => task.id !== taskId
      );
      updateTaskStatuses(currentTime, updatedTasks);
    },
    [currentTime, tasks, updateTaskStatuses]
  );

  const completeTask = useCallback(
    (taskId) => {
      const updatedTasks = [...tasks.scheduled, ...tasks.deferred].map((task) =>
        task.id === taskId
          ? { ...task, status: "completed", endTime: currentTime }
          : task
      );
      updateTaskStatuses(currentTime, updatedTasks);
    },
    [currentTime, tasks, updateTaskStatuses]
  );

  const editTask = useCallback(
    (taskId, updatedTask) => {
      const updatedTasks = [...tasks.scheduled, ...tasks.deferred].map((task) =>
        task.id === taskId ? { ...task, ...updatedTask } : task
      );
      updateTaskStatuses(currentTime, updatedTasks);
    },
    [currentTime, tasks, updateTaskStatuses]
  );

  const handleAdjustSchedule = useCallback(
    (adjustments) => {
      const { scheduledTasks, deferredTasks, remainingTime } = adjustSchedule(
        [...tasks.scheduled, ...tasks.deferred],
        adjustments,
        currentTime
      );
      setTasks({ scheduled: scheduledTasks, deferred: deferredTasks });
      setRemainingTime(remainingTime);
    },
    [currentTime, tasks]
  );

  const handleMoveToNextDay = useCallback(
    (taskId) => {
      const { scheduledTasks, deferredTasks, remainingTime } =
        moveTaskToNextDay(
          taskId,
          [...tasks.scheduled, ...tasks.deferred],
          currentTime
        );
      setTasks({ scheduled: scheduledTasks, deferred: deferredTasks });
      setRemainingTime(remainingTime);
    },
    [currentTime, tasks]
  );

  const openMoveTaskModal = (task) => {
    setTaskToMove(task);
    setIsMovingTask(true);
  };

  const handleMoveTask = (taskId, newDate) => {
    const updatedTasks = [...tasks.scheduled, ...tasks.deferred].map((task) =>
      task.id === taskId
        ? { ...task, startTime: newDate, status: "pending" }
        : task
    );
    updateTaskStatuses(currentTime, updatedTasks);
    setIsMovingTask(false);
    setTaskToMove(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        <Header
          currentTime={currentTime}
          remainingTime={remainingTime}
          setViewMode={setViewMode}
          setIsAddingTask={setIsAddingTask}
        />
        <Main>
          <Sidebar
            tasks={tasks.deferred}
            handleMoveToNextDay={handleMoveToNextDay}
            handleAdjustSchedule={handleAdjustSchedule}
          />
          <Content
            viewMode={viewMode}
            tasks={tasks.scheduled}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            deleteTask={deleteTask}
            completeTask={completeTask}
            editTask={editTask}
            currentTime={currentTime}
            openMoveTaskModal={openMoveTaskModal}
          />
          <TaskInsights
            reschedulingSuggestions={reschedulingSuggestions}
            timeBlockSummary={timeBlockSummary}
          />
        </Main>
        <BottomNavigation
          setViewMode={setViewMode}
          setIsAddingTask={setIsAddingTask}
        />
        <FAB onClick={() => setIsAddingTask(true)}>+</FAB>
        {isAddingTask && (
          <Modal>
            <ModalContent>
              <AddTaskForm
                addTask={addTask}
                onCancel={() => setIsAddingTask(false)}
              />
            </ModalContent>
          </Modal>
        )}
        {isMovingTask && taskToMove && (
          <Modal>
            <ModalContent>
              <MoveTaskModal
                task={taskToMove}
                onMove={handleMoveTask}
                onCancel={() => setIsMovingTask(false)}
                currentTasks={[...tasks.scheduled, ...tasks.deferred]}
                currentTime={currentTime}
              />
            </ModalContent>
          </Modal>
        )}
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;
