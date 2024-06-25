// src/utils/productivityInsights.js

import { isToday, isThisWeek, differenceInMinutes } from "date-fns";

export function getProductivityInsights(tasks) {
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const todaysTasks = tasks.filter(
    (task) => task.startTime && isToday(new Date(task.startTime))
  );
  const thisWeeksTasks = tasks.filter(
    (task) => task.startTime && isThisWeek(new Date(task.startTime))
  );

  const tasksCompletedToday = completedTasks.filter((task) =>
    isToday(new Date(task.endTime))
  ).length;
  const tasksCompletedThisWeek = completedTasks.filter((task) =>
    isThisWeek(new Date(task.endTime))
  ).length;

  const totalEstimatedTime = completedTasks.reduce(
    (sum, task) => sum + task.duration,
    0
  );
  const totalActualTime = completedTasks.reduce(
    (sum, task) =>
      sum +
      differenceInMinutes(new Date(task.endTime), new Date(task.startTime)),
    0
  );

  const timeEstimationAccuracy =
    totalEstimatedTime > 0
      ? Math.round((totalActualTime / totalEstimatedTime) * 100)
      : 100;

  const mostProductivePlace = getMostProductivePlace(completedTasks);
  const mostFrequentPriority = getMostFrequentPriority(tasks);

  const patterns = [
    `You've completed ${tasksCompletedToday} tasks today and ${tasksCompletedThisWeek} this week.`,
    `Your time estimation accuracy is ${timeEstimationAccuracy}%.`,
    `You seem to be most productive when working ${mostProductivePlace}.`,
    `Most of your tasks are marked as "${mostFrequentPriority}" priority.`,
  ];

  const recommendations = [
    timeEstimationAccuracy < 90
      ? "Try to improve your time estimation accuracy by breaking tasks into smaller, more manageable chunks."
      : "Great job on accurately estimating task durations!",
    `Consider scheduling more tasks to be done ${mostProductivePlace} when possible.`,
    pendingTasks.length > 5
      ? "You have several pending tasks. Consider prioritizing or delegating some of them."
      : "You're managing your task load well!",
    todaysTasks.length === 0
      ? "You don't have any tasks scheduled for today. Consider planning your day in advance."
      : "Good job on planning tasks for today!",
  ];

  return {
    patterns,
    recommendations,
    progressMetrics: {
      tasksCompletedToday,
      tasksCompletedThisWeek,
      totalTasks: tasks.length,
      pendingTasks: pendingTasks.length,
      timeEstimationAccuracy,
    },
    areasForImprovement: [
      timeEstimationAccuracy < 90 ? "Time estimation accuracy" : null,
      pendingTasks.length > 5 ? "Task prioritization" : null,
      todaysTasks.length === 0 ? "Daily planning" : null,
    ].filter(Boolean),
  };
}

function getMostProductivePlace(completedTasks) {
  const placeCounts = completedTasks.reduce((counts, task) => {
    counts[task.place] = (counts[task.place] || 0) + 1;
    return counts;
  }, {});

  return Object.entries(placeCounts).sort((a, b) => b[1] - a[1])[0][0];
}

function getMostFrequentPriority(tasks) {
  const priorityCounts = tasks.reduce((counts, task) => {
    counts[task.priority] = (counts[task.priority] || 0) + 1;
    return counts;
  }, {});

  return Object.entries(priorityCounts).sort((a, b) => b[1] - a[1])[0][0];
}
