import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
});

export async function parseTaskInput(userInput) {
  try {
    if (!process.env.REACT_APP_ANTHROPIC_API_KEY) {
      throw new Error("Anthropic API key is not set in environment variables");
    }

    const response = await anthropic.messages.create({
      max_tokens: 1024,
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
      model: "claude-3-haiku-20240307",
    });

    return JSON.parse(response.content[0].text);
  } catch (error) {
    console.error("Error parsing task input:", error);
    return null;
  }
}
