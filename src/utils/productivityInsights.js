// productivityInsights.js

import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  parseISO,
  isValid,
} from "date-fns";

export const getProductivityInsights = (tasks) => {
  if (!tasks || tasks.length === 0) {
    return {
      mostProductiveDay: null,
      leastProductiveDay: null,
      mostProductiveTimeOfDay: null,
      taskCompletionRate: 0,
      averageTaskDuration: 0,
      weeklyProductivity: [],
    };
  }

  // Helper function to safely parse dates
  const safeParseDate = (dateInput) => {
    if (dateInput instanceof Date && isValid(dateInput)) {
      return dateInput;
    }
    if (typeof dateInput === "string") {
      try {
        const parsedDate = parseISO(dateInput);
        if (isValid(parsedDate)) {
          return parsedDate;
        }
      } catch (error) {
        console.error("Error parsing date string:", dateInput);
      }
    }
    console.error("Invalid date input:", dateInput);
    return null;
  };

  // Group tasks by day
  const tasksByDay = tasks.reduce((acc, task) => {
    const startTime = safeParseDate(task.startTime);
    if (!startTime) return acc;

    const day = format(startTime, "EEEE"); // Full day name
    if (!acc[day]) acc[day] = [];
    acc[day].push(task);
    return acc;
  }, {});

  // Calculate productivity for each day
  const productivityByDay = Object.entries(tasksByDay).map(
    ([day, dayTasks]) => ({
      day,
      productivity: dayTasks.reduce(
        (sum, task) => sum + (task.duration || 0),
        0
      ),
    })
  );

  // Find most and least productive days
  let mostProductiveDay = null;
  let leastProductiveDay = null;
  if (productivityByDay.length > 0) {
    mostProductiveDay = productivityByDay.reduce((max, day) =>
      day.productivity > max.productivity ? day : max
    ).day;
    leastProductiveDay = productivityByDay.reduce((min, day) =>
      day.productivity < min.productivity ? day : min
    ).day;
  }

  // Calculate most productive time of day
  const tasksByHour = tasks.reduce((acc, task) => {
    const startTime = safeParseDate(task.startTime);
    if (!startTime) return acc;

    const hour = startTime.getHours();
    if (!acc[hour]) acc[hour] = 0;
    acc[hour] += task.duration || 0;
    return acc;
  }, {});

  const mostProductiveHour = Object.entries(tasksByHour).reduce(
    (max, [hour, duration]) =>
      duration > max.duration ? { hour: Number(hour), duration } : max,
    { hour: null, duration: 0 }
  ).hour;

  const mostProductiveTimeOfDay =
    mostProductiveHour !== null
      ? `${mostProductiveHour}:00 - ${(mostProductiveHour + 1) % 24}:00`
      : null;

  // Calculate task completion rate
  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const taskCompletionRate =
    tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  // Calculate average task duration
  const totalDuration = tasks.reduce(
    (sum, task) => sum + (task.duration || 0),
    0
  );
  const averageTaskDuration =
    tasks.length > 0 ? totalDuration / tasks.length : 0;

  // Calculate weekly productivity
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weeklyProductivity = daysOfWeek.map((day) => {
    const dayName = format(day, "EEEE");
    const dayTasks = tasksByDay[dayName] || [];
    const productivity = dayTasks.reduce(
      (sum, task) => sum + (task.duration || 0),
      0
    );
    return {
      day: dayName,
      productivity: productivity,
    };
  });

  return {
    mostProductiveDay,
    leastProductiveDay,
    mostProductiveTimeOfDay,
    taskCompletionRate,
    averageTaskDuration,
    weeklyProductivity,
  };
};

export const getProductivityTrend = (weeklyProductivity) => {
  if (!weeklyProductivity || weeklyProductivity.length < 2) {
    return "Not enough data";
  }

  const firstHalf = weeklyProductivity.slice(
    0,
    Math.floor(weeklyProductivity.length / 2)
  );
  const secondHalf = weeklyProductivity.slice(
    Math.floor(weeklyProductivity.length / 2)
  );

  const firstHalfAvg =
    firstHalf.reduce((sum, day) => sum + day.productivity, 0) /
    firstHalf.length;
  const secondHalfAvg =
    secondHalf.reduce((sum, day) => sum + day.productivity, 0) /
    secondHalf.length;

  if (secondHalfAvg > firstHalfAvg * 1.1) {
    return "Increasing";
  } else if (secondHalfAvg < firstHalfAvg * 0.9) {
    return "Decreasing";
  } else {
    return "Stable";
  }
};

export const getSuggestedImprovements = (insights) => {
  const suggestions = [];

  if (insights.taskCompletionRate < 70) {
    suggestions.push(
      "Try to improve your task completion rate by setting more realistic goals or breaking tasks into smaller, manageable chunks."
    );
  }

  if (insights.leastProductiveDay) {
    suggestions.push(
      `Your least productive day is ${insights.leastProductiveDay}. Consider adjusting your schedule or environment on this day to boost productivity.`
    );
  }

  if (insights.mostProductiveTimeOfDay) {
    suggestions.push(
      `You're most productive during ${insights.mostProductiveTimeOfDay}. Try scheduling your most important tasks during this time.`
    );
  }

  if (insights.averageTaskDuration > 120) {
    suggestions.push(
      "Your average task duration is quite long. Consider breaking larger tasks into smaller, more manageable subtasks."
    );
  }

  return suggestions;
};
