import React, { useState, useEffect, useCallback } from "react";
import {
  MantineProvider,
  ColorSchemeProvider,
  AppShell,
  Navbar,
  Header,
  Text,
  Button,
  Switch,
  Group,
  Stack,
  Modal,
  TextInput,
  NumberInput,
  Select,
  ActionIcon,
} from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";
import { useColorScheme } from "@mantine/hooks";
import {
  format,
  addDays,
  setHours,
  setMinutes,
  isAfter,
  isBefore,
} from "date-fns";
import {
  IconSun,
  IconMoonStars,
  IconPlus,
  IconClock,
  IconCalendar,
  IconList,
  IconAdjustments,
} from "@tabler/icons-react";
import { triageTasks, adjustSchedule } from "./schedulingUtils";

const LOCAL_STORAGE_KEY = "todoListSchedulerTasks";

const App = () => {
  const preferredColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState(preferredColorScheme);
  const toggleColorScheme = () =>
    setColorScheme(colorScheme === "dark" ? "light" : "dark");

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedTasks
      ? JSON.parse(savedTasks)
      : { scheduled: [], deferred: [] };
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState("list");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [remainingTime, setRemainingTime] = useState(0);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    duration: 30,
    priority: "should do",
    place: "home",
  });
  const [wakeUpTime, setWakeUpTime] = useState(
    setHours(setMinutes(new Date(), 0), 8)
  ); // Default wake-up time: 8:00 AM

  const updateTaskStatuses = useCallback((time, currentTasks) => {
    const { scheduledTasks, deferredTasks, remainingTime } = triageTasks(
      currentTasks,
      time
    );
    setTasks({ scheduled: scheduledTasks, deferred: deferredTasks });
    setRemainingTime(remainingTime);
  }, []);

  useEffect(() => {
    updateTaskStatuses(currentTime, [...tasks.scheduled, ...tasks.deferred]);
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const addTask = useCallback(
    (task) => {
      const now = new Date();
      const taskStartTime = isAfter(now, wakeUpTime) ? now : wakeUpTime;
      const newTask = {
        ...task,
        id: Date.now(),
        startTime: taskStartTime,
        status: "pending",
      };
      updateTaskStatuses(currentTime, [
        ...tasks.scheduled,
        ...tasks.deferred,
        newTask,
      ]);
      setIsAddingTask(false);
      setNewTask({
        title: "",
        duration: 30,
        priority: "should do",
        place: "home",
      });
    },
    [currentTime, tasks, wakeUpTime, updateTaskStatuses]
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

  const renderTaskList = () => (
    <Stack spacing="md">
      {tasks.scheduled.map((task) => (
        <Group
          key={task.id}
          position="apart"
          style={{
            backgroundColor: colorScheme === "dark" ? "#25262b" : "#f8f9fa",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <Stack spacing={0}>
            <Text weight={500}>{task.title}</Text>
            <Text size="sm" color="dimmed">
              {task.duration} min - {task.priority} - {task.place}
            </Text>
            <Text size="sm" color="dimmed">
              {format(task.startTime, "h:mm a")}
            </Text>
          </Stack>
          <Group>
            <ActionIcon
              color="blue"
              onClick={() => editTask(task.id, { ...task })}
            >
              <IconAdjustments size={16} />
            </ActionIcon>
            <ActionIcon color="green" onClick={() => completeTask(task.id)}>
              <IconClock size={16} />
            </ActionIcon>
            <ActionIcon color="red" onClick={() => deleteTask(task.id)}>
              <IconPlus size={16} style={{ transform: "rotate(45deg)" }} />
            </ActionIcon>
          </Group>
        </Group>
      ))}
    </Stack>
  );

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme }}
        withGlobalStyles
        withNormalizeCSS
      >
        <AppShell
          padding="md"
          navbar={
            <Navbar width={{ base: 300 }} p="xs">
              <Navbar.Section>
                <Group position="apart">
                  <Text size="xl" weight={700}>
                    Task Scheduler
                  </Text>
                  <Switch
                    checked={colorScheme === "dark"}
                    onChange={toggleColorScheme}
                    size="lg"
                    onLabel={<IconMoonStars size={16} stroke={2.5} />}
                    offLabel={<IconSun size={16} stroke={2.5} />}
                  />
                </Group>
              </Navbar.Section>
              <Navbar.Section grow mt="md">
                <Button
                  fullWidth
                  leftIcon={<IconPlus size={16} />}
                  onClick={() => setIsAddingTask(true)}
                >
                  Add Task
                </Button>
                <Group grow mt="sm">
                  <Button
                    variant={viewMode === "list" ? "filled" : "light"}
                    onClick={() => setViewMode("list")}
                    leftIcon={<IconList size={16} />}
                  >
                    List
                  </Button>
                  <Button
                    variant={viewMode === "calendar" ? "filled" : "light"}
                    onClick={() => setViewMode("calendar")}
                    leftIcon={<IconCalendar size={16} />}
                  >
                    Calendar
                  </Button>
                </Group>
              </Navbar.Section>
              <Navbar.Section>
                <Text size="sm" weight={500} mb={5}>
                  Wake-up Time
                </Text>
                <TimeInput
                  value={wakeUpTime}
                  onChange={(newTime) => setWakeUpTime(newTime)}
                  icon={<IconClock size={16} />}
                />
              </Navbar.Section>
            </Navbar>
          }
          header={
            <Header height={60} p="xs">
              <Group position="apart">
                <Text>Current Time: {format(currentTime, "h:mm a")}</Text>
                <Text>Remaining Time: {Math.round(remainingTime)} minutes</Text>
              </Group>
            </Header>
          }
        >
          {viewMode === "list" ? (
            renderTaskList()
          ) : (
            <Text>Calendar View (To be implemented)</Text>
          )}

          <Modal
            opened={isAddingTask}
            onClose={() => setIsAddingTask(false)}
            title="Add New Task"
          >
            <Stack>
              <TextInput
                label="Task Title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
              />
              <NumberInput
                label="Duration (minutes)"
                value={newTask.duration}
                onChange={(value) =>
                  setNewTask({ ...newTask, duration: value })
                }
                min={1}
              />
              <Select
                label="Priority"
                value={newTask.priority}
                onChange={(value) =>
                  setNewTask({ ...newTask, priority: value })
                }
                data={[
                  { value: "must do", label: "Must Do" },
                  { value: "should do", label: "Should Do" },
                  { value: "if time available", label: "If Time Available" },
                ]}
              />
              <Select
                label="Place"
                value={newTask.place}
                onChange={(value) => setNewTask({ ...newTask, place: value })}
                data={[
                  { value: "home", label: "Home" },
                  { value: "work", label: "Work" },
                ]}
              />
              <Button onClick={() => addTask(newTask)}>Add Task</Button>
            </Stack>
          </Modal>
        </AppShell>
      </MantineProvider>
    </ColorSchemeProvider>
  );
};

export default App;
