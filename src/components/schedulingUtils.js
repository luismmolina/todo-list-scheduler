import { differenceInMinutes, addMinutes } from "date-fns";

const BUFFER_TIME = 10; // 10 minutes buffer between tasks
const TIME_BLOCKS = [
  { start: 8, end: 14.5, place: "home" },
  { start: 15, end: 17, place: "work" },
  { start: 17, end: 22, place: "home" },
  { start: 22, end: 8, place: "sleep" },
];

const priorityOrder = ["must do", "should do", "if time available"];

const calculateTaskScore = (task, currentTime) => {
  const priorityScore = priorityOrder.indexOf(task.priority) * 10;
  const urgencyScore = task.deadline
    ? Math.max(0, 100 - differenceInMinutes(task.deadline, currentTime) / 60)
    : 0;
  const durationScore = Math.min(task.duration, 120) / 2; // Favor shorter tasks, max score for 4 hours
  return priorityScore + urgencyScore + durationScore;
};

const findNextSlot = (startTime, taskPlace, duration, existingTasks) => {
  let currentTime = new Date(startTime);
  const endOfDay = new Date(currentTime);
  endOfDay.setHours(24, 0, 0, 0);

  while (currentTime < endOfDay) {
    const currentHour = currentTime.getHours();
    const slot = TIME_BLOCKS.find(
      (slot) =>
        ((currentHour >= slot.start && currentHour < slot.end) ||
          (slot.start > slot.end &&
            (currentHour >= slot.start || currentHour < slot.end))) &&
        slot.place === taskPlace
    );

    if (slot) {
      const slotEnd = new Date(currentTime);
      slotEnd.setHours(slot.end, 0, 0, 0);
      if (slot.end < slot.start) {
        slotEnd.setDate(slotEnd.getDate() + 1);
      }

      const conflictingTask = existingTasks.find(
        (task) =>
          task.status !== "completed" &&
          currentTime < task.endTime &&
          addMinutes(currentTime, duration + BUFFER_TIME) > task.startTime
      );

      if (
        !conflictingTask &&
        differenceInMinutes(slotEnd, currentTime) >= duration + BUFFER_TIME
      ) {
        return currentTime;
      }

      if (conflictingTask) {
        currentTime = new Date(
          conflictingTask.endTime.getTime() + BUFFER_TIME * 60000
        );
      } else {
        currentTime = addMinutes(currentTime, 1);
      }
    } else {
      currentTime = addMinutes(currentTime, 60);
      currentTime.setMinutes(0, 0, 0);
    }
  }

  return null;
};

export const scheduleTask = (task, currentTime, existingTasks) => {
  let startTime = findNextSlot(
    currentTime,
    task.place,
    task.duration,
    existingTasks
  );

  if (!startTime) {
    return { ...task, status: "deferred", startTime: null, endTime: null };
  }

  const endTime = addMinutes(startTime, task.duration);

  let status = "pending";
  if (startTime <= currentTime && endTime > currentTime) {
    status = "ongoing";
  } else if (endTime <= currentTime) {
    status = "overdue";
  }

  return { ...task, startTime, endTime, status };
};

export const triageTasks = (tasks, currentTime) => {
  const bedTime = new Date(currentTime);
  bedTime.setHours(22, 0, 0, 0);
  if (bedTime <= currentTime) {
    bedTime.setDate(bedTime.getDate() + 1);
  }

  let availableTime = differenceInMinutes(bedTime, currentTime);

  const sortedTasks = [...tasks].sort(
    (a, b) =>
      calculateTaskScore(b, currentTime) - calculateTaskScore(a, currentTime)
  );

  let scheduledTasks = [];
  let deferredTasks = [];

  for (let task of sortedTasks) {
    if (task.status === "completed") {
      scheduledTasks.push(task);
    } else {
      const scheduledTask = scheduleTask(task, currentTime, scheduledTasks);
      if (scheduledTask.status !== "deferred") {
        scheduledTasks.push(scheduledTask);
        availableTime -= scheduledTask.duration + BUFFER_TIME;
      } else {
        deferredTasks.push(scheduledTask);
      }
    }
  }

  availableTime = Math.max(0, availableTime);

  return { scheduledTasks, deferredTasks, remainingTime: availableTime };
};

export const suggestRescheduling = (tasks, currentTime) => {
  const { scheduledTasks, deferredTasks } = triageTasks(tasks, currentTime);

  const overdueTasks = scheduledTasks.filter(
    (task) => task.status === "overdue"
  );
  const tightScheduleTasks = scheduledTasks.filter(
    (task) =>
      task.status === "pending" &&
      differenceInMinutes(task.startTime, currentTime) < 30
  );

  const suggestedRescheduling = [
    ...overdueTasks.map((task) => ({
      task,
      reason: "This task is overdue.",
      suggestion: "Reschedule for today or move to tomorrow.",
    })),
    ...tightScheduleTasks.map((task) => ({
      task,
      reason:
        "This task is scheduled to start soon, but you might not have enough time.",
      suggestion: "Consider rescheduling or adjusting the duration.",
    })),
    ...deferredTasks.map((task) => ({
      task,
      reason: "This task couldn't be scheduled today.",
      suggestion: "Try scheduling for tomorrow or adjusting its priority.",
    })),
  ];

  return suggestedRescheduling;
};

export const getTimeBlockSummary = (currentTime) => {
  const summaries = TIME_BLOCKS.map((block) => {
    const blockStart = new Date(currentTime);
    blockStart.setHours(block.start, 0, 0, 0);
    const blockEnd = new Date(currentTime);
    blockEnd.setHours(block.end, 0, 0, 0);
    if (block.end < block.start) {
      blockEnd.setDate(blockEnd.getDate() + 1);
    }

    return {
      place: block.place,
      start: blockStart,
      end: blockEnd,
      duration: differenceInMinutes(blockEnd, blockStart),
    };
  });

  return summaries;
};

export const adjustSchedule = (tasks, adjustments, currentTime) => {
  const updatedTasks = tasks.map((task) => {
    const adjustment = adjustments.find((adj) => adj.id === task.id);
    if (adjustment) {
      return { ...task, ...adjustment };
    }
    return task;
  });

  return triageTasks(updatedTasks, currentTime);
};

export const moveTaskToNextDay = (taskId, tasks, currentTime) => {
  const nextDay = new Date(currentTime);
  nextDay.setDate(nextDay.getDate() + 1);
  nextDay.setHours(9, 0, 0, 0);

  const updatedTasks = tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, startTime: nextDay, status: "pending" };
    }
    return task;
  });

  return triageTasks(updatedTasks, currentTime);
};
