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

  const { userInput } = req.body;
  console.log("User input:", userInput);

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
            content: `Parse the following task input and extract these details:
          - Task title
          - Estimated duration (in minutes)
          - Priority (must do, should do, if time available)
          - Location (home, work, or unspecified)
          - Deadline (if mentioned)

          User input: "${userInput}"

          Respond in JSON format.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.log("Anthropic API error:", response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Anthropic API response:", data);
    const content = data.content[0].text;
    const parsedTask = JSON.parse(content);
    console.log("Parsed task:", parsedTask);

    res.status(200).json(parsedTask);
  } catch (error) {
    console.error("Error parsing task input:", error);
    res.status(500).json({ error: "Error parsing task input" });
  }
};
