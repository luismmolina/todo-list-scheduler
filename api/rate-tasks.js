const fetch = require("node-fetch");

module.exports = async (req, res) => {
  console.log("Rate tasks API route called");
  console.log("Request body:", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { tasks } = req.body;
  const API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;
  const API_URL = "https://api.anthropic.com/v1/messages";

  if (!API_KEY) {
    return res.status(500).json({ error: "Anthropic API key is not set" });
  }

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
            content: `Rate the following tasks based on their long-term benefit to the user. Provide a rating from 1-10 (10 being highest value) and a brief rationale for each rating.

        Tasks:
        ${tasks
          .map(
            (task) =>
              `- ${task.title} (Duration: ${task.duration} minutes, Priority: ${task.priority})`
          )
          .join("\n")}

        Respond in JSON format with an array of objects, each containing 'longTermValue' and 'rationale'.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Anthropic API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.content[0].text;
    const ratings = JSON.parse(content);

    res.status(200).json(ratings);
  } catch (error) {
    console.error("Error in rate-tasks function:", error);
    res.status(500).json({ error: error.message || "Error rating tasks" });
  }
};
