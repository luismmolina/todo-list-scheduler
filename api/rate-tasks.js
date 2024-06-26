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
    (task, index) =>
      `${index + 1}. ${task.title} (Duration: ${
        task.duration
      } minutes, Priority: ${task.priority})`
  )
  .join("\n")}

Respond ONLY with a valid JSON array of objects, each containing 'longTermValue' (a number) and 'rationale' (a string). Do not include any other text. Example:
[
  {"longTermValue": 8, "rationale": "This task contributes significantly to long-term goals."},
  {"longTermValue": 5, "rationale": "This task has moderate long-term impact."}
]`,
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

    let ratings;
    try {
      ratings = JSON.parse(content);
    } catch (parseError) {
      console.error("Error parsing API response:", content);
      throw new Error("Invalid response format from Anthropic API");
    }

    if (!Array.isArray(ratings) || ratings.length !== tasks.length) {
      throw new Error("Unexpected response format from Anthropic API");
    }

    const ratedTasks = tasks.map((task, index) => ({
      ...task,
      longTermValue: ratings[index].longTermValue,
      rationale: ratings[index].rationale,
    }));

    res.status(200).json(ratedTasks);
  } catch (error) {
    console.error("Error in rate-tasks function:", error);
    res.status(500).json({ error: error.message || "Error rating tasks" });
  }
};
