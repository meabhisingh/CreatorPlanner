import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SeriesComponent } from "./component";

export const Loader = () => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Header Skeleton */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {Array(4)
          .fill(0)
          .map((_, index) => (
            <Card key={index} className="glass-card min-h-[350px] flex flex-col shadow-lg border-none">
              <CardHeader className="space-y-4 pb-4">
                <div className="flex justify-between">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded flex-shrink-0" />
                </div>
                <div className="space-y-2 line-clamp-2 h-10 w-full">
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                 {/* Progress skeleton */}
                 <div className="flex justify-between mb-2">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-3 w-6" />
                 </div>
                 <Skeleton className="h-2 w-full mb-6" />

                 <Skeleton className="h-3 w-16 mb-4" />
                 <div className="space-y-2">
                   <Skeleton className="h-10 w-full" />
                   <Skeleton className="h-10 w-full" />
                   <Skeleton className="h-10 w-full" />
                 </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default function SeriesPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<Loader />}>
        <Main />
      </Suspense>
    </div>
  );
}

const Main = async () => {
  const sessionData = await getServerSession();

  const user = sessionData?.user;

  if (!user) redirect("/sign-in");

  const series = await prisma.series.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { videos: true },
      },
      videos: {
        take: 3,
        select: {
          id: true,
          title: true,
          status: true,
          thumbnailIdea: true,
          thumbnailKey: true,
        },
      },
    },
  });

  return <SeriesComponent initialSeries={series} />;
};
