// src/utils/taskRatingSystem.js

export async function getTaskRatings(tasks) {
  try {
    const response = await fetch("/api/rate-tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tasks }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const ratings = await response.json();

    return ratings.map((rating, index) => ({
      ...tasks[index],
      longTermValue: rating.longTermValue,
      rationale: rating.rationale,
    }));
  } catch (error) {
    console.error("Error getting task ratings:", error);
    return tasks.map((task) => ({
      ...task,
      longTermValue: 5,
      rationale: "Error in rating",
    }));
  }
}
