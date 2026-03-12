import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CalendarComponent } from "./component";

export const Loader = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <Card className="glass-card border-none shadow-2xl overflow-hidden">
        <div className="grid grid-cols-7 border-b bg-secondary/30">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="py-3 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array(35)
            .fill(0)
            .map((_, idx) => (
              <div
                key={idx}
                className="min-h-[140px] border-b border-r p-2 transition-colors"
              >
                <div className="flex justify-between items-center mb-2">
                  <Skeleton className="h-7 w-7 rounded-full" />
                </div>
                <div className="space-y-2">
                  {idx % 5 === 0 && <Skeleton className="h-12 w-full" />}
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};

export default function CalendarPage() {
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

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch only videos that have a publishDate set to show on the calendar
  const videos = await prisma.video.findMany({
    where: {
      userId: user.id,
      publishDate: {
        not: null,
      },
    },
    orderBy: { publishDate: "asc" },
  });

  return <CalendarComponent initialVideos={videos} userId={user.id} />;
};
