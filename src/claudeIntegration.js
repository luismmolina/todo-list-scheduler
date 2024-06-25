export async function parseTaskInput(taskInput) {
  try {
    console.log("Preparing to send request to parse task:", taskInput);

    // Convert the task object to a string description
    const taskDescription = `Title: ${taskInput.title}, Duration: ${taskInput.duration} minutes, Priority: ${taskInput.priority}, Location: ${taskInput.place}`;

    console.log("Sending request to parse task:", taskDescription);
    const response = await fetch("/api/parse-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userInput: taskDescription }),
    });

    console.log("Received response:", response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Parsed task data:", data);
    return data;
  } catch (error) {
    console.error("Error parsing task input:", error);
    console.error("Error details:", error.message);
    return null;
  }
}
