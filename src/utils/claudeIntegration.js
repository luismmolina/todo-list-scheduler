export async function parseTaskInput(taskInput) {
  try {
    console.log("Preparing to send request to parse task:", taskInput);

    // Get completed tasks from localStorage
    const completedTasks = JSON.parse(
      localStorage.getItem("completedTasks") || "[]"
    );
    const completedTitles = completedTasks.map((task) =>
      task.title.toLowerCase()
    );

    // Convert the task object to a string description
    const taskDescription = `Title: ${taskInput.title}, Duration: ${taskInput.duration} minutes, Priority: ${taskInput.priority}, Location: ${taskInput.place}`;

    console.log("Sending request to parse task:", taskDescription);
    const response = await fetch("/api/parse-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userInput: taskDescription,
        completedTasks: completedTitles,
      }),
    });

    console.log("Received response:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response body:", errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorText}`
      );
    }

    const data = await response.json();
    console.log("Parsed task data:", data);
    return data;
  } catch (error) {
    console.error("Error parsing task input:", error);
    console.error("Error details:", error.message);
    return { error: error.message };
  }
}
