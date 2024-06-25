// api/parse-task.js

const fetch = require("node-fetch");

module.exports = async (req, res) => {
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
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userInput } = req.body;
  const API_KEY = process.env.ANTHROPIC_API_KEY;
  const API_URL = "https://api.anthropic.com/v1/messages";

  if (!API_KEY) {
    return res.status(500).json({ error: "Anthropic API key is not set" });
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
    const parsedTask = JSON.parse(content);

    res.status(200).json(parsedTask);
  } catch (error) {
    console.error("Error parsing task input:", error);
    res.status(500).json({ error: "Error parsing task input" });
  }
};
