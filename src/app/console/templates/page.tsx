import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TemplatesComponent } from "./component";

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
            <Card key={index} className="glass-card min-h-[250px] flex flex-col shadow-lg border-none">
              <CardHeader className="space-y-4 pb-4">
                <div className="flex justify-between">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <div className="space-y-2 h-10 w-full pt-2">
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                 <Skeleton className="h-3 w-32 mb-4" />
                 <div className="flex gap-2">
                   <Skeleton className="h-6 w-16 rounded-full" />
                   <Skeleton className="h-6 w-16 rounded-full" />
                   <Skeleton className="h-6 w-16 rounded-full" />
                 </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default function TemplatesPage() {
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

  const templates = await prisma.template.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return <TemplatesComponent initialTemplates={templates} />;
};
