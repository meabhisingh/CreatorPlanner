"use server";

import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const createSeriesAction = async (name: string, description?: string) => {
  try {
    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    const series = await prisma.series.create({
      data: {
        name,
        description,
        userId: user.id,
      },
    });

    revalidatePath("/console/series");

    return { success: true, series };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
};

export const updateSeriesAction = async (
  id: string,
  data: { name?: string; description?: string },
) => {
  try {
    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    const series = await prisma.series.update({
      where: { id, userId: user.id },
      data,
    });

    revalidatePath("/console/series");
    
    return { success: true, series };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
};

export const deleteSeriesAction = async (id: string) => {
  try {
    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    await prisma.series.delete({
      where: { id, userId: user.id },
    });

    revalidatePath("/console/series");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
};

export const createSeriesEpisodeAction = async (seriesId: string, title: string) => {
  try {
    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    const series = await prisma.series.findUnique({
      where: { id: seriesId, userId: user.id },
    });

    if (!series) throw new Error("Series not found");

    const video = await prisma.video.create({
      data: {
        title,
        userId: user.id,
        seriesId,
        status: "Script",
      },
    });

    revalidatePath("/console/series");
    
    return { success: true, video };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
};

export const removeVideoFromSeriesAction = async (videoId: string) => {
  try {
    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    const video = await prisma.video.update({
      where: { id: videoId, userId: user.id },
      data: { seriesId: null },
    });

    revalidatePath("/console/series");
    
    return { success: true, video };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
};

export const toggleVideoStatusAction = async (videoId: string, currentStatus: string) => {
  try {
    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    const targetStatus = currentStatus === "Published" ? "Script" : "Published";

    const video = await prisma.video.update({
      where: { id: videoId, userId: user.id },
      data: { status: targetStatus },
    });

    revalidatePath("/console/series");
    
    return { success: true, video };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
};
