"use server";

import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const createTemplateAction = async (
  name: string,
  description: string,
  structure: string[],
) => {
  try {
    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    const template = await prisma.template.create({
      data: {
        name,
        description,
        structure,
        userId: user.id,
      },
    });

    revalidatePath("/console/templates");
    return { success: true, template };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
};

export const deleteTemplateAction = async (id: string) => {
  try {
    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    await prisma.template.delete({
      where: { id, userId: user.id },
    });

    revalidatePath("/console/templates");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
};

export const incrementTemplateUsageAction = async (id: string) => {
  try {
    const sessionData = await getServerSession();
    const user = sessionData?.user;

    if (!user?.id) throw new Error("Unauthorized");

    const template = await prisma.template.update({
      where: { id, userId: user.id },
      data: {
        usage: {
          increment: 1,
        },
      },
    });

    revalidatePath("/console/templates");
    return { success: true, template };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
};
