"use server";

import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptApiKey } from "@/lib/security";

export const saveOpenAPIKey = async (key: string) => {
  try {
    const session = await getServerSession();

    const user = session?.user;

    if (!user) throw new Error("Unauthorized");

    const encryptedKey = encryptApiKey(key);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        openaiApiKey: encryptedKey,
      },
      select: { id: true },
    });

    return {
      success: true,
      encryptedKey,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
};

export const deleteOpenAPIKey = async () => {
  try {
    const session = await getServerSession();

    const user = session?.user;

    if (!user) throw new Error("Unauthorized");

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        openaiApiKey: null,
      },
      select: { id: true },
    });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
};

export const saveChannelSettings = async (data: {
  name: string;
  handle?: string;
  description?: string;
  primaryNiche: string;
  uploadFrequency: "Daily" | "Twice_a_week" | "Weekly" | "Monthly";
  language?: string;
  country?: string;
}) => {
  try {
    const session = await getServerSession();
    const user = session?.user;

    if (!user) throw new Error("Unauthorized");

    await prisma.channel.upsert({
      where: {
        userId: user.id,
      },
      update: {
        ...data,
      },
      create: {
        userId: user.id,
        ...data,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
};

export const saveNotificationSettingsAction = async (data: {
  productionReminders: boolean;
  aiGenerationAlerts: boolean;
  weeklyProgressReport: boolean;
}) => {
  try {
    const session = await getServerSession();
    const user = session?.user;

    if (!user) throw new Error("Unauthorized");

    await prisma.notificationPreference.upsert({
      where: {
        userId: user.id,
      },
      update: {
        ...data,
      },
      create: {
        userId: user.id,
        ...data,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
};

export const deleteAccountAction = async () => {
  try {
    const session = await getServerSession();
    const user = session?.user;

    if (!user) throw new Error("Unauthorized");

    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete account",
    };
  }
};
