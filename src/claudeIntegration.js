// src/claudeIntegration.js

export async function parseTaskInput(userInput) {
  const API_KEY = process.env.REACT_APP_SMARTS;
  const API_URL = "https://api.anthropic.com/v1/messages";

  if (!API_KEY) {
    throw new Error("Anthropic API key is not set");
  }

  const prompt = `
      Parse the following task input and extract these details:
      - Task title
      - Estimated duration (in minutes)
      - Priority (must do, should do, if time available)
      - Location (home, work, or unspecified)
      - Deadline (if mentioned)
  
      User input: "${userInput}"
  
      Respond in JSON format.
    `;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    return JSON.parse(content);
  } catch (error) {
    console.error("Error parsing task input:", error);
    return null;
  }
}
