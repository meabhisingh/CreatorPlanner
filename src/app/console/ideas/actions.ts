"use server";

import { generateIdea, generateIdeaDescription } from "@/lib/ai";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const deleteIdea = async (id: string) => {
  try {
    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    const idea = await prisma.idea.delete({
      where: { id },
    });

    return {
      success: true,
      idea,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete idea. Please try again.",
    };
  }
};

export const createIdea = async (formData: FormData) => {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const niche = formData.get("niche") as string;
    const priority = formData.get("priority") as string;

    const sessionData = await getServerSession();

    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    const idea = await prisma.idea.create({
      data: {
        userId: user.id,
        title,
        description,
        niche,
        tags: niche ? [niche.toLowerCase()] : [],
        priority,
      },
    });

    return {
      success: true,
      idea,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create idea. Please try again.",
    };
  }
};

export const generateDescriptionAction = async ({
  ideaTitle,
}: Omit<Parameters<typeof generateIdeaDescription>[0], "encryptedKey">) => {
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

    const data = await generateIdeaDescription({ ideaTitle, encryptedKey });

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

export const generateIdeaAction = async (
  options: Omit<Parameters<typeof generateIdea>[0], "encryptedKey">,
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

    const data = await generateIdea({ ...options, encryptedKey });
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

export const updateIdeaStatus = async (ideaId: string, status: string) => {
  try {
    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    const idea = await prisma.idea.update({
      where: { id: ideaId },
      data: { status },
    });

    return {
      success: true,
      idea,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update idea status. Please try again.",
    };
  }
};
