import { format, isToday, isTomorrow, isThisWeek, isThisMonth } from "date-fns";

export const separateTasks = (tasks) => {
  const pending = tasks.filter((task) => task.status !== "completed");
  const completed = tasks.filter((task) => task.status === "completed");
  return { pending, completed };
};

export const sortTasks = (tasks) => {
  const statusOrder = ["ongoing", "overdue", "pending"];
  return tasks.sort((a, b) => {
    if (a.status !== b.status) {
      return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
    }
    if (a.startTime && b.startTime) {
      return a.startTime - b.startTime;
    }
    if (a.startTime) return -1;
    if (b.startTime) return 1;
    return 0;
  });
};

export const groupTasksByDate = (tasks) => {
  const groups = {};
  tasks.forEach((task) => {
    let dateGroup;
    if (!task.startTime) {
      dateGroup = "Unscheduled";
    } else if (isToday(task.startTime)) {
      dateGroup = "Today";
    } else if (isTomorrow(task.startTime)) {
      dateGroup = "Tomorrow";
    } else if (isThisWeek(task.startTime)) {
      dateGroup = "This Week";
    } else if (isThisMonth(task.startTime)) {
      dateGroup = "This Month";
    } else {
      dateGroup = format(task.startTime, "MMMM yyyy");
    }

    if (!groups[dateGroup]) {
      groups[dateGroup] = [];
    }
    groups[dateGroup].push(task);
  });

  // Sort tasks within each group
  Object.keys(groups).forEach((key) => {
    groups[key] = sortTasks(groups[key]);
  });

  return groups;
};

export const getNextTask = (tasks) => {
  const sortedTasks = sortTasks(
    tasks.filter((task) => task.status !== "completed")
  );
  return sortedTasks[0] || null;
};

export const calculateTaskProgress = (task, currentTime) => {
  if (task.status !== "ongoing" || !task.startTime || !task.endTime) return 0;
  const elapsed = currentTime - task.startTime;
  const total = task.endTime - task.startTime;
  return Math.min(100, (elapsed / total) * 100);
};

export const getPriorityLevel = (priority) => {
  switch (priority.toLowerCase()) {
    case "high":
    case "must do":
      return 3;
    case "medium":
    case "should do":
      return 2;
    case "low":
    case "if time available":
      return 1;
    default:
      return 0;
  }
};

export const formatTaskDuration = (duration) => {
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  if (hours > 0) {
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
  }
  return `${minutes}m`;
};

export const isTaskOverdue = (task, currentTime) => {
  return (
    task.status === "pending" && task.endTime && task.endTime < currentTime
  );
};

export const getTaskStatusColor = (task, theme, currentTime) => {
  if (task.status === "completed") return theme.colors.success;
  if (task.status === "ongoing") return theme.colors.warning;
  if (isTaskOverdue(task, currentTime)) return theme.colors.error;
  return theme.colors.primary;
};
