export async function parseTaskInput(userInput) {
  try {
    console.log("Sending request to parse task:", userInput);
    const response = await fetch("/api/parse-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userInput }),
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
