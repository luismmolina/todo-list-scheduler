const fetch = require("node-fetch");

module.exports = async (req, res) => {
  console.log("API route called");
  console.log("Request method:", req.method);
  console.log("Request body:", req.body);

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    console.log("Method not allowed:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userInput, completedTasks } = req.body;
  console.log("User input:", userInput);
  console.log("Completed tasks:", completedTasks);

  const API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;
  const API_URL = "https://api.anthropic.com/v1/messages";

  if (!API_KEY) {
    console.log("API key not set");
    return res.status(500).json({ error: "Anthropic API key is not set" });
  }

  console.log("Sending request to Anthropic API");

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
        messages: [
          {
            role: "user",
            content: `Parse the following task description and extract these details, but IGNORE any tasks whose titles match (case-insensitive) any of these completed tasks: ${JSON.stringify(
              completedTasks
            )}

            Extract:
            - Task title
            - Estimated duration (in minutes)
            - Priority (must do, should do, if time available)
            - Location (home, work, or unspecified)
            - Deadline (if mentioned)

            Task description: "${userInput}"

            If the task title matches any completed task, return { "ignored": true }. Otherwise, respond in JSON format with the parsed details.`,
          },
        ],
      }),
    });

    console.log("Anthropic API response status:", response.status);

    if (!response.ok) {
      console.log("Anthropic API error:", response.status, response.statusText);
      throw new Error(
        `Anthropic API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Anthropic API response data:", data);

    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error("Unexpected response format from Anthropic API");
    }

    const content = data.content[0].text;
    console.log("Parsed content:", content);

    const parsedTask = JSON.parse(content);

    // If the task was ignored because it's completed, return null
    if (parsedTask.ignored) {
      return res.status(200).json(null);
    }

    res.status(200).json(parsedTask);
  } catch (error) {
    console.error("Error in parse-task function:", error);
    res
      .status(500)
      .json({ error: error.message || "Error parsing task input" });
  }
};
