import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { IdeaVaultComponent } from "./component";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { statusStages } from "./constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const Loader = () => {
  return (
    <div className="flex flex-col gap-4  mb-6">
      {/* Header Skeleton */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-32" />
      {/* Search + Tabs Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4">
        <Skeleton className="h-10 flex-1" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      {/* Board Skeleton */}
      <div className="overflow-x-auto mt-6">
        <div className="flex gap-6 min-w-max">
          {statusStages.map((stage) => (
            <div key={stage} className="w-80 space-y-4">
              {/* Column Header Skeleton */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Badge
                    variant="secondary"
                    className="h-5 rounded-full px-2 text-[10px]"
                  >
                    <Skeleton className="h-2 w-4" />
                  </Badge>
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              {/* Cards Skeleton */}
              <div className="kanban-column bg-secondary/10 border border-border/50 min-h-[500px] flex flex-col gap-4 p-2">
                {Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <Card key={index} className="p-4 glass-card">
                      <CardHeader className="space-y-2 p-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </CardHeader>
                      <CardContent className="p-2">
                        <Skeleton className="h-3 w-full mb-1" />
                        <Skeleton className="h-3 w-3/4" />
                      </CardContent>
                    </Card>
                  ))}
                {/* Empty state placeholder */}
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border/30 rounded-lg h-32 pointer-events-none">
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function IdeaVaultPage() {
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

  const ideas = await prisma.idea.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const templates = await prisma.template.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return <IdeaVaultComponent initialIdeas={ideas} templates={templates} />;
};
