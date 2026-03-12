"use server";

import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePresignedUrl } from "@/lib/storage";
import { randomUUID } from "crypto";

export const updateVideoDetails = async (videoId: string, data: any) => {
  try {
    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    // Verify ownership
    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId, userId: user.id },
    });

    if (!existingVideo) {
      throw new Error("Video not found or unauthorized");
    }

    const video = await prisma.video.update({
      where: { id: videoId },
      data,
    });

    return {
      success: true,
      video,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update video. Please try again.",
    };
  }
};

export const createTask = async (videoId: string, taskName: string) => {
  try {
    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    // Verify ownership
    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId, userId: user.id },
    });

    if (!existingVideo) {
      throw new Error("Video not found or unauthorized");
    }

    const task = await prisma.task.create({
      data: {
        videoId,
        taskName,
        completed: false,
      },
    });

    return {
      success: true,
      task,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create task. Please try again.",
    };
  }
};

export const toggleTaskCompletion = async (
  taskId: string,
  completed: boolean,
) => {
  try {
    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    // We should ideally check if the task belongs to a video owned by the user,
    // but Prisma's direct update is simpler. Let's do a relational check for security.
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { video: true },
    });

    if (!existingTask || existingTask.video.userId !== user.id) {
      throw new Error("Task not found or unauthorized");
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { completed },
    });

    return {
      success: true,
      task,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to toggle task. Please try again.",
    };
  }
};

export const deleteTaskAction = async (taskId: string) => {
  try {
    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { video: true },
    });

    if (!existingTask || existingTask.video.userId !== user.id) {
      throw new Error("Task not found or unauthorized");
    }

    const task = await prisma.task.delete({
      where: { id: taskId },
    });

    return {
      success: true,
      task,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete task. Please try again.",
    };
  }
};

export const deleteVideoAction = async (videoId: string) => {
  try {
    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId, userId: user.id },
    });

    if (!existingVideo) {
      throw new Error("Video not found or unauthorized");
    }

    // First delete all related tasks due to constraints (or rely on Cascade if configured, currently it's not cascaded in Prisma scheme)
    await prisma.task.deleteMany({
      where: { videoId },
    });

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
      message: "Failed to delete video. Please try again.",
    };
  }
};

export const thumbnailUploadAction = async (
  id: string,
  contentType: string,
) => {
  try {
    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    let thumbnailKey: string | null = null;

    const video = await prisma.video.findUnique({
      where: { id, userId: user.id },
      select: {
        thumbnailKey: true,
      },
    });

    if (!video) throw new Error("Video not found or unauthorized");

    thumbnailKey = video.thumbnailKey;

    if (!thumbnailKey) {
      const randomId = randomUUID();
      await prisma.video.update({
        where: { id, userId: user.id },
        data: {
          thumbnailKey: randomId,
        },
      });
      thumbnailKey = randomId;
    }

    const url = await generatePresignedUrl({
      fileName: thumbnailKey,
      contentType,
    });

    return {
      success: true,
      url,
      thumbnailKey,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
};
