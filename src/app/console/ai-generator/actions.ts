"use server";

import { generateVideoIdeas } from "@/lib/ai";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const generateVideoIdeasAction = async (
  options: Omit<Parameters<typeof generateVideoIdeas>[0], "encryptedKey">,
) => {
  try {
    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        openaiApiKey: true,
      },
    });

    const encryptedKey = dbUser?.openaiApiKey;

    if (!encryptedKey)
      throw new Error("Please provide your OpenAI API key in the settings");

    const data = await generateVideoIdeas({ ...options, encryptedKey });

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to generate description. Please try again.",
    };
  }
};

export const saveGeneratedIdeaAction = async (
  title: string,
  description: string,
  targetNiche: string,
) => {
  try {
    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    const idea = await prisma.idea.create({
      data: {
        userId: user.id,
        title,
        description,
        niche: targetNiche,
        tags: targetNiche ? [targetNiche.toLowerCase()] : [],
        priority: "Medium",
        status: "Idea",
      },
    });

    return {
      success: true,
      idea,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to save the idea.",
    };
  }
};
