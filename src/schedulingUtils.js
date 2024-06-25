const timeSlots = [
  { start: 9, end: 17, place: "work" },
  { start: 17, end: 22, place: "home" },
  { start: 22, end: 9, place: "sleep" },
];

const priorityOrder = ["must do", "should do", "if time available"];
const BUFFER_TIME = 10; // 10 minutes buffer between tasks

const findNextSlot = (startTime, taskPlace, duration, existingTasks) => {
  let currentTime = new Date(startTime);
  const endOfDay = new Date(currentTime);
  endOfDay.setHours(22, 0, 0, 0);

  while (currentTime < endOfDay) {
    const currentHour = currentTime.getHours();
    const slot = timeSlots.find(
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
          new Date(currentTime.getTime() + (duration + BUFFER_TIME) * 60000) >
            task.startTime
      );

      if (
        !conflictingTask &&
        (slotEnd - currentTime) / 60000 >= duration + BUFFER_TIME
      ) {
        return currentTime;
      }

      if (conflictingTask) {
        currentTime = new Date(
          conflictingTask.endTime.getTime() + BUFFER_TIME * 60000
        );
      } else {
        // Move to the next hour
        currentTime.setHours(currentTime.getHours() + 1, 0, 0, 0);
      }
    } else {
      // Move to the next hour
      currentTime.setHours(currentTime.getHours() + 1, 0, 0, 0);
    }
  }

  // If no suitable slot found within the day, return null
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
    // If no suitable slot found, the task will be deferred
    return {
      ...task,
      status: "deferred",
      startTime: null,
      endTime: null,
    };
  }

  const endTime = new Date(startTime.getTime() + task.duration * 60000);

  // Determine initial status
  let status = "pending";
  if (startTime <= currentTime && endTime > currentTime) {
    status = "ongoing";
  } else if (endTime <= currentTime) {
    status = "overdue";
  }

  return {
    ...task,
    startTime,
    endTime,
    status,
  };
};

export const triageTasks = (tasks, currentTime) => {
  const bedTime = new Date(currentTime);
  bedTime.setHours(22, 0, 0, 0);
  if (bedTime <= currentTime) {
    bedTime.setDate(bedTime.getDate() + 1);
  }

  let availableTime = (bedTime - currentTime) / 60000; // in minutes

  // Sort tasks by priority and then by scheduled start time
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (b.status === "completed" && a.status !== "completed") return -1;
    const priorityDiff =
      priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
    if (priorityDiff !== 0) return priorityDiff;
    return (a.startTime || new Date(0)) - (b.startTime || new Date(0));
  });

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

  // Ensure availableTime is not negative
  availableTime = Math.max(0, availableTime);

  return { scheduledTasks, deferredTasks, remainingTime: availableTime };
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
