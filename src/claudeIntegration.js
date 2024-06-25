// src/claudeIntegration.js

export async function parseTaskInput(userInput) {
  try {
    const response = await fetch("/api/parse-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userInput }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error parsing task input:", error);
    return null;
  }
}
