"use server";

import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const createVideoProject = async (formData: FormData) => {
  try {
    const title = formData.get("title") as string;
    const deadline = formData.get("deadline") as string;
    const stage = formData.get("stage") as string;

    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    const video = await prisma.video.create({
      data: {
        userId: user.id,
        title,
        status: stage,
        deadlineDate: deadline ? new Date(deadline) : null,
      },
    });

    return {
      success: true,
      video,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create video project. Please try again.",
    };
  }
};

export const updateVideoStatus = async (videoId: string, status: string) => {
  try {
    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    const video = await prisma.video.update({
      where: { id: videoId },
      data: { status },
    });

    return {
      success: true,
      video,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update video status. Please try again.",
    };
  }
};

export const deleteVideoProject = async (videoId: string) => {
  try {
    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    const video = await prisma.video.delete({
      where: { id: videoId },
    });

    return {
      success: true,
      video,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete video project. Please try again.",
    };
  }
};
