import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Clock,
  Video,
  Lightbulb,
  TrendingUp,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { getPublicUrl } from "@/constants/bucket";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const userId = session.user.id;

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [
    ideasCount,
    inProductionCount,
    scheduledCount,
    thisMonthPublished,
    lastMonthPublished,
  ] = await Promise.all([
    prisma.idea.count({ where: { userId } }),
    prisma.video.count({
      where: { userId, status: { notIn: ["Published", "Scheduled"] } },
    }),
    prisma.video.count({ where: { userId, status: "Scheduled" } }),
    prisma.video.count({
      where: {
        userId,
        status: "Published",
        publishDate: {
          not: null,
          gte: startOfThisMonth,
          lt: startOfNextMonth,
        },
      },
    }),

    prisma.video.count({
      where: {
        userId,
        status: "Published",
        publishDate: {
          not: null,
          gte: startOfLastMonth,
          lt: startOfThisMonth,
        },
      },
    }),
  ]);

  let growthPercent = 0;

  if (lastMonthPublished === 0) {
    growthPercent = thisMonthPublished > 0 ? 100 : 0;
  } else {
    growthPercent =
      ((thisMonthPublished - lastMonthPublished) / lastMonthPublished) * 100;
  }

  const growthString = `${growthPercent >= 0 ? "+" : ""}${Math.round(
    growthPercent,
  )}%`;

  const stats = [
    {
      label: "Ideas Saved",
      value: ideasCount.toString(),
      icon: Lightbulb,
      color: "text-amber-400",
    },
    {
      label: "In Production",
      value: inProductionCount.toString(),
      icon: Video,
      color: "text-primary",
    },
    {
      label: "Scheduled",
      value: scheduledCount.toString(),
      icon: Calendar,
      color: "text-emerald-400",
    },
    {
      label: "Monthly Growth",
      value: growthString,
      icon: TrendingUp,
      color: growthPercent >= 0 ? "text-emerald-400" : "text-red-400",
    },
  ];

  const upcomingVideos = await prisma.video.findMany({
    where: { userId, status: { not: "Published" } },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const nextVideo = await prisma.video.findFirst({
    where: {
      userId,
      status: { in: ["Scheduled", "Editing", "Recording", "Script"] },
    },
    orderBy: [{ publishDate: "asc" }, { createdAt: "asc" }],
  });

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "No date";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const formatDateTime = (date: Date | null | undefined) => {
    if (!date) return "No date set";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Creator Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name?.split(" ")[0] || "there"}. Here's
            what's happening with your content.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/console/ideas">
              <Plus className="mr-2 h-4 w-4" /> New Idea
            </Link>
          </Button>
          <Button asChild>
            <Link href="/console/pipeline">
              <Video className="mr-2 h-4 w-4" /> Start Video
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-7">
        <Card className="md:col-span-4 glass-card flex flex-col">
          <CardHeader>
            <CardTitle>Upcoming Videos</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {upcomingVideos.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 border rounded-lg bg-secondary/10">
                  No upcoming videos. Time to start creating!
                </div>
              ) : (
                upcomingVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-4 transition-colors hover:bg-secondary/40"
                  >
                    <div className="space-y-1">
                      <p className="font-medium line-clamp-1">{video.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary border-none"
                        >
                          {video.status}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{" "}
                          {formatDate(video.deadlineDate)}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/console/video/${video.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 glass-card flex flex-col">
          <CardHeader>
            <CardTitle>Next Scheduled Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col flex-1">
            {nextVideo ? (
              <>
                <Link
                  href={`/console/video/${nextVideo.id}`}
                  className="block w-full"
                >
                  <div className="aspect-video w-full rounded-xl bg-secondary/50 flex items-center justify-center border-2 border-dashed border-border/50 group hover:border-primary/50 cursor-pointer transition-colors p-4 relative overflow-hidden">
                    {nextVideo.thumbnailKey ? (
                      <Image
                        width={400}
                        height={200}
                        src={getPublicUrl(nextVideo.thumbnailKey)}
                        alt={nextVideo.title}
                        className="absolute inset-0 w-full h-full object-cover   group-hover:opacity-50 transition-opacity"
                      />
                    ) : null}
                    <div className="text-center space-y-2 p-4 relative z-10 drop-shadow-md">
                      {!nextVideo.thumbnailKey && (
                        <Video className="mx-auto h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                      <p className="text-sm text-foreground/80 font-medium  group-hover:opacity-100 opacity-0 transition-opacity">
                        {formatDateTime(
                          nextVideo.publishDate || nextVideo.deadlineDate,
                        )}
                      </p>
                      <p className="font-bold text-lg line-clamp-2 group-hover:opacity-100 opacity-0 transition-opacity">
                        "{nextVideo.title}"
                      </p>
                    </div>
                  </div>
                </Link>
                <div className="space-y-2 mt-auto pt-4">
                  <div className="flex justify-between text-xs">
                    <span>Production Progress</span>
                    <span>
                      {nextVideo.status === "Scheduled"
                        ? "100%"
                        : nextVideo.status === "Editing"
                          ? "80%"
                          : nextVideo.status === "Recording"
                            ? "50%"
                            : "20%"}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(82,82,224,0.5)] transition-all duration-500"
                      style={{
                        width:
                          nextVideo.status === "Scheduled"
                            ? "100%"
                            : nextVideo.status === "Editing"
                              ? "80%"
                              : nextVideo.status === "Recording"
                                ? "50%"
                                : "20%",
                      }}
                    ></div>
                  </div>
                </div>
                <Button className="w-full" asChild>
                  <Link href={`/console/video/${nextVideo.id}`}>
                    Open Project
                  </Link>
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 space-y-4 py-8 border rounded-lg bg-secondary/10">
                <Video className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm">
                  No videos in production
                </p>
                <Button variant="outline" asChild>
                  <Link href="/console/ideas">Start a New Video</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
