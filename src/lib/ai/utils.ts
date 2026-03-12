import "server-only";

import { generateText, Output } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { decryptApiKey } from "../security";

export const generateIdeaDescription = async ({
  ideaTitle,
  encryptedKey,
}: {
  ideaTitle: string;
  encryptedKey: string;
}) => {
  try {
    const decryptedKey = decryptApiKey(encryptedKey);

    const openai = createOpenAI({
      apiKey: decryptedKey,
    });

    const { text } = await generateText({
      model: openai("gpt-5-nano"),
      prompt: `
Write a short and engaging YouTube video description.

Title: ${ideaTitle}

Rules:
- Maximum 2 sentences
- Clear and engaging
- No hashtags
- No emojis
- No markdown
`,
    });

    return text.trim();
  } catch (error) {
    console.error("AI description generation failed:", error);
    return "";
  }
};

export const generateIdea = async ({
  title,
  encryptedKey,
  alreadyDoneIdeas = [],
}: {
  alreadyDoneIdeas: string[];
  encryptedKey: string;
  title: string;
}) => {
  try {
    const decryptedKey = decryptApiKey(encryptedKey);

    const openai = createOpenAI({
      apiKey: decryptedKey,
    });

    const { output } = await generateText({
      model: openai("gpt-5-nano"),
      prompt: `Generate a fresh YouTube video idea for ${title}, ensuring it's distinct from these previously done ideas: ${alreadyDoneIdeas.join(", ")}.`,

      output: Output.object({
        schema: z.object({
          title: z.string().describe("The title of the video idea"),
          description: z
            .string()
            .describe("A brief description of the video idea"),
          niche: z
            .string()
            .describe(
              "The niche or category of the video idea, comma seperated if multiple",
            ),
          priority: z
            .enum(["Low", "Medium", "High"])
            .describe("The priority level of the video idea"),
        }),
      }),
    });

    return output;
  } catch (error) {
    return {
      title: "",
      description: "",
      niche: "",
      priority: "Medium",
    };
  }
};

const VideoIdeaSchema = z.object({
  title: z.string().describe("A catchy and relevant video title."),
  description: z.string().describe("A brief description of the video idea."),
  thumbnailConcept: z
    .string()
    .describe("A concept or idea for the video thumbnail."),
});

type VideoIdea = z.infer<typeof VideoIdeaSchema>;

export const generateVideoIdeas = async ({
  channelNiche,
  targetAudience,
  encryptedKey,
  videoType,
}: {
  channelNiche: string;
  targetAudience: string;
  encryptedKey: string;
  videoType: string;
}): Promise<VideoIdea[]> => {
  const ideas: VideoIdea[] = [];

  const decryptedKey = decryptApiKey(encryptedKey);

  const openai = createOpenAI({
    apiKey: decryptedKey,
  });

  const count = 4;

  for (let i = 0; i < count; i++) {
    try {
      const { output } = await generateText({
        model: openai("gpt-5-nano"),
        prompt: `
You are a YouTube content strategist. Generate 1 unique video idea for a channel with the following:

- Niche: ${channelNiche}
- Target Audience: ${targetAudience}
- Video Type: ${videoType}

Rules:
- Provide a title
- Provide a short description (1-2 sentences, clear, engaging, no hashtags, no emojis)
- Suggest a thumbnail concept

Return as JSON with keys: title, description, thumbnailConcept.
Ensure it's distinct from previously generated ideas.
Previously generated titles: ${ideas.map((i) => i.title).join(", ") || "None"}
        `,
        output: Output.object({ schema: VideoIdeaSchema }),
      });

      if (output) ideas.push(output);
    } catch (error) {
      console.error("Failed to generate video idea:", error);
    }
  }

  return ideas;
};
