import React, { useState, useEffect, useCallback } from "react";
import { ThemeProvider } from "styled-components";
import { parseTaskInput } from "./claudeIntegration";
import { DynamicScheduler } from "./DynamicScheduler";
import { theme } from "./theme";
import GlobalStyle from "./globalStyles";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Content from "./components/Content";
import { Modal, ModalContent } from "./components/Modal";
import AddTaskForm from "./components/AddTaskForm";
import MoveTaskModal from "./components/MoveTaskModal";
import BottomNavigation from "./components/BottomNavigation";
import TaskInsights from "./components/TaskInsights";
import styled from "styled-components";
import { differenceInMinutes, addDays, startOfDay } from "date-fns";

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
  const [scheduler, setScheduler] = useState(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [viewMode, setViewMode] = useState("list");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isMovingTask, setIsMovingTask] = useState(false);
  const [taskToMove, setTaskToMove] = useState(null);
  const [reschedulingSuggestions, setReschedulingSuggestions] = useState([]);
  const [timeBlockSummary, setTimeBlockSummary] = useState([]);

  useEffect(() => {
    const savedTasksString = localStorage.getItem(LOCAL_STORAGE_KEY);
    let initialTasks = [];
    if (savedTasksString) {
      try {
        initialTasks = JSON.parse(savedTasksString).map((task) => ({
          ...task,
          startTime: task.startTime ? new Date(task.startTime) : null,
          endTime: task.endTime ? new Date(task.endTime) : null,
        }));
      } catch (error) {
        console.error("Error parsing initial saved tasks:", error);
      }
    }
    const newScheduler = new DynamicScheduler(initialTasks, new Date());
    setScheduler(newScheduler);
  }, []);

  useEffect(() => {
    if (scheduler) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scheduler.tasks));
    }
  }, [scheduler]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime((prevTime) => {
        const newTime = new Date(prevTime.getTime() + 60000);
        if (scheduler) {
          const updatedSchedule = scheduler.updateCurrentTime(newTime);
          setScheduler(new DynamicScheduler(updatedSchedule, newTime));
        }
        return newTime;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, [scheduler]);

  useEffect(() => {
    if (scheduler) {
      const suggestions = generateReschedulingSuggestions(
        scheduler.tasks,
        currentTime
      );
      setReschedulingSuggestions(suggestions);
      const summary = generateTimeBlockSummary(scheduler.schedule, currentTime);
      setTimeBlockSummary(summary);
    }
  }, [scheduler, currentTime]);

  const addTask = useCallback(
    async (taskInput) => {
      if (scheduler) {
        const parsedTask = await parseTaskInput(taskInput);
        if (parsedTask) {
          const newTask = {
            id: Date.now(),
            ...parsedTask,
            status: "pending",
          };
          const updatedSchedule = scheduler.addTask(newTask);
          setScheduler(new DynamicScheduler(updatedSchedule, currentTime));
        }
      }
      setIsAddingTask(false);
    },
    [scheduler, currentTime]
  );

  const deleteTask = useCallback(
    (taskId) => {
      if (scheduler) {
        const updatedTasks = scheduler.tasks.filter(
          (task) => task.id !== taskId
        );
        const updatedSchedule = new DynamicScheduler(
          updatedTasks,
          currentTime
        ).optimizeSchedule();
        setScheduler(new DynamicScheduler(updatedSchedule, currentTime));
      }
    },
    [scheduler, currentTime]
  );

  const completeTask = useCallback(
    (taskId) => {
      if (scheduler) {
        const updatedSchedule = scheduler.completeTask(taskId);
        setScheduler(new DynamicScheduler(updatedSchedule, currentTime));
      }
    },
    [scheduler, currentTime]
  );

  const editTask = useCallback(
    (taskId, updatedTask) => {
      if (scheduler) {
        const updatedTasks = scheduler.tasks.map((task) =>
          task.id === taskId ? { ...task, ...updatedTask } : task
        );
        const updatedSchedule = new DynamicScheduler(
          updatedTasks,
          currentTime
        ).optimizeSchedule();
        setScheduler(new DynamicScheduler(updatedSchedule, currentTime));
      }
    },
    [scheduler, currentTime]
  );

  const handleMoveTask = (taskId, newDate) => {
    if (scheduler) {
      const updatedTasks = scheduler.tasks.map((task) =>
        task.id === taskId
          ? { ...task, startTime: newDate, status: "pending" }
          : task
      );
      const updatedSchedule = new DynamicScheduler(
        updatedTasks,
        currentTime
      ).optimizeSchedule();
      setScheduler(new DynamicScheduler(updatedSchedule, currentTime));
    }
    setIsMovingTask(false);
    setTaskToMove(null);
  };

  const openMoveTaskModal = (task) => {
    setTaskToMove(task);
    setIsMovingTask(true);
  };

  const handleMoveToNextDay = (taskId) => {
    if (scheduler) {
      const task = scheduler.tasks.find((t) => t.id === taskId);
      if (task) {
        const nextDay = addDays(startOfDay(currentTime), 1);
        const updatedTask = { ...task, startTime: nextDay, status: "pending" };
        const updatedTasks = scheduler.tasks.map((t) =>
          t.id === taskId ? updatedTask : t
        );
        const updatedSchedule = new DynamicScheduler(
          updatedTasks,
          currentTime
        ).optimizeSchedule();
        setScheduler(new DynamicScheduler(updatedSchedule, currentTime));
      }
    }
  };

  const handleAdjustSchedule = (adjustments) => {
    if (scheduler) {
      const updatedTasks = scheduler.tasks.map((task) => {
        const adjustment = adjustments.find((adj) => adj.id === task.id);
        return adjustment ? { ...task, ...adjustment } : task;
      });
      const updatedSchedule = new DynamicScheduler(
        updatedTasks,
        currentTime
      ).optimizeSchedule();
      setScheduler(new DynamicScheduler(updatedSchedule, currentTime));
    }
  };

  const generateReschedulingSuggestions = (tasks, currentTime) => {
    const overdueTasks = tasks.filter(
      (task) =>
        task.status === "pending" &&
        task.startTime &&
        task.startTime < currentTime
    );
    const upcomingTasks = tasks.filter(
      (task) =>
        task.status === "pending" &&
        task.startTime &&
        differenceInMinutes(task.startTime, currentTime) <= 30
    );
    const deferredTasks = tasks.filter((task) => task.status === "deferred");

    return [
      ...overdueTasks.map((task) => ({
        task,
        reason: "This task is overdue.",
        suggestion: "Reschedule for today or move to tomorrow.",
      })),
      ...upcomingTasks.map((task) => ({
        task,
        reason: "This task is starting soon.",
        suggestion: "Prepare to start this task or reschedule if needed.",
      })),
      ...deferredTasks.map((task) => ({
        task,
        reason: "This task couldn't be scheduled.",
        suggestion: "Consider adjusting its priority or duration.",
      })),
    ];
  };

  const generateTimeBlockSummary = (schedule, currentTime) => {
    const summary = [];
    let currentBlock = null;

    schedule.forEach((task) => {
      if (!currentBlock || task.place !== currentBlock.place) {
        if (currentBlock) {
          summary.push(currentBlock);
        }
        currentBlock = {
          place: task.place,
          start: task.startTime,
          end: task.endTime,
          duration: task.duration,
        };
      } else {
        currentBlock.end = task.endTime;
        currentBlock.duration += task.duration;
      }
    });

    if (currentBlock) {
      summary.push(currentBlock);
    }

    return summary;
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        <Header
          currentTime={currentTime}
          remainingTime={scheduler ? scheduler.getRemainingTime() : 0}
          setViewMode={setViewMode}
          setIsAddingTask={setIsAddingTask}
        />
        <Main>
          <Sidebar
            tasks={
              scheduler
                ? scheduler.tasks.filter((t) => t.status === "deferred")
                : []
            }
            handleMoveToNextDay={handleMoveToNextDay}
            handleAdjustSchedule={handleAdjustSchedule}
          />
          <Content
            viewMode={viewMode}
            tasks={scheduler ? scheduler.schedule : []}
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
                currentTasks={scheduler ? scheduler.tasks : []}
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
