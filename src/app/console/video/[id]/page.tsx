import { Suspense } from "react";
import { getServerSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VideoPlanningComponent } from "./component";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export const Loader = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 md:w-96" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex gap-4 mb-6">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
              <div className="pt-4 border-t flex gap-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default async function VideoPlanningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <Suspense fallback={<Loader />}>
        <Main id={id} />
      </Suspense>
    </div>
  );
}

const Main = async ({ id }: { id: string }) => {
  const sessionData = await getServerSession();
  const user = sessionData?.user;

  if (!user) {
    redirect("/sign-in");
  }

  const video = await prisma.video.findUnique({
    where: {
      id: id,
      userId: user.id,
    },
    include: {
      tasks: {
        orderBy: {
          id: "asc",
        },
      },
    },
  });

  if (!video) {
    notFound();
  }

  const seriesList = await prisma.series.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true }
  });

  return <VideoPlanningComponent initialVideo={video} seriesList={seriesList} />;
};
