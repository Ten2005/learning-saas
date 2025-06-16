import { ChatMessage } from "@/types";

const getResponse = async (
  messages: ChatMessage[],
  model: string,
  systemMessage: string,
) => {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "system", content: systemMessage }, ...messages],
      }),
    },
  );

  const data = await response.json();
  return data.choices[0].message.content;
};

export default getResponse;
