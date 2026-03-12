"use server";

import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const scheduleVideoAction = async (formData: FormData) => {
  try {
    const title = formData.get("title") as string;
    const dateStr = formData.get("date") as string;
    const time = (formData.get("time") as string) || "10:00";
    const status = (formData.get("status") as string) || "Scheduled";

    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");
    
    // Combine date and time
    const dateTimeStr = `${dateStr}T${time}:00`;
    const publishDate = new Date(dateTimeStr);

    const video = await prisma.video.create({
      data: {
        userId: user.id,
        title,
        status,
        publishDate,
      },
    });

    return {
      success: true,
      video,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to schedule video. Please try again.",
    };
  }
};
