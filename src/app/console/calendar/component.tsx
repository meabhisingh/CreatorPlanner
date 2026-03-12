"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Video as VideoIcon,
  Plus,
  Clock,
  Loader2,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Video } from "@/generated/prisma/browser";
import { scheduleVideoAction } from "./actions";

export const CalendarComponent = ({
  initialVideos,
  userId,
}: {
  initialVideos: Video[];
  userId: string;
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 9, 1)); // We should probably update this to the actual current date New Date() eventually, but keeping 2024, 9, 1 for your mock data context if any, though now we're using real DB data. Let's switch to today.
  // Using today's date instead of hardcoded
  const [activeDate, setActiveDate] = useState(new Date());

  const [scheduledVideos, setScheduledVideos] =
    useState<Video[]>(initialVideos);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { toast } = useToast();

  const monthStart = startOfMonth(activeDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setActiveDate(addMonths(activeDate, 1));
  const prevMonth = () => setActiveDate(subMonths(activeDate, 1));

  function openScheduleDialog(date?: Date) {
    if (date) setSelectedDate(date);
    else setSelectedDate(new Date());
    setIsDialogOpen(true);
  }

  async function handleScheduleVideo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const dateStr = formData.get("date") as string;
    const time = (formData.get("time") as string) || "10:00";
    const status = (formData.get("status") as string) || "Scheduled";

    if (!title || !dateStr) {
      setLoading(false);
      return;
    }

    const dateTimeStr = `${dateStr}T${time}:00`;
    const publishDate = new Date(dateTimeStr);

    const optimisticVideo: Video = {
      id: Math.random().toString(36).substring(7),
      title,
      publishDate,
      status,
      userId,
      thumbnailIdea: null,
      description: null,
      hook: null,
      scriptOutline: null,
      deadlineDate: null,
      targetAudience: null,
      notes: null,
      seriesId: null,
      tags: [],
      keywords: [],
      createdAt: new Date(),
    };

    setScheduledVideos((prev) => [...prev, optimisticVideo]);
    setIsDialogOpen(false);

    try {
      const result = await scheduleVideoAction(formData);

      if (!result.success || !result.video) {
        throw new Error("Failed to create");
      }

      setScheduledVideos((prev) =>
        prev.map((v) => (v.id === optimisticVideo.id ? result.video : v)),
      );

      toast({
        title: "Video Scheduled",
        description: `"${title}" has been scheduled for ${format(
          new Date(result.video.publishDate!),
          "PPP",
        )}.`,
      });
    } catch (error) {
      setScheduledVideos((prev) =>
        prev.filter((v) => v.id !== optimisticVideo.id),
      );
      toast({
        title: "Error",
        description: "Failed to schedule video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Get upcoming deadlines from our Video array (videos with deadlines in the future or today)
  const upcomingDeadlines = scheduledVideos
    .filter(
      (v) =>
        v.deadlineDate && new Date(v.deadlineDate) >= startOfMonth(new Date()),
    )
    .sort(
      (a, b) =>
        new Date(a.deadlineDate!).getTime() -
        new Date(b.deadlineDate!).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Content Calendar
          </h1>
          <p className="text-muted-foreground">
            Manage your publishing schedule and deadlines.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-secondary/50 rounded-lg p-1">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-4 font-semibold">
              {format(activeDate, "MMMM yyyy")}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => openScheduleDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Schedule Video
          </Button>
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
          {days.map((day, idx) => {
            const dayVideos = scheduledVideos.filter(
              (v) => v.publishDate && isSameDay(new Date(v.publishDate), day),
            );
            const isToday = isSameDay(new Date(), day);

            return (
              <div
                key={idx}
                className={`min-h-[140px] border-b border-r p-2 transition-colors hover:bg-secondary/10 group ${
                  !isSameMonth(day, monthStart)
                    ? "bg-background text-muted-foreground opacity-30"
                    : ""
                }`}
                // Make the cell clickable to easily add a video on this date
                onClick={(e) => {
                  // Don't open if clicking on a video link
                  if ((e.target as HTMLElement).closest("a")) return;
                  openScheduleDialog(day);
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday ? "bg-primary text-white" : ""
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {dayVideos.length > 0 ? (
                    <Badge className="text-[10px] bg-primary/20 text-primary border-none">
                      {dayVideos.length}
                    </Badge>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          openScheduleDialog(day);
                        }}
                      >
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  {dayVideos.map((video) => (
                    <Link href={`/console/video/${video.id}`} key={video.id}>
                      <div className="group/video bg-primary/10 border border-primary/20 rounded-md p-2 cursor-pointer hover:bg-primary/20 transition-all mt-1">
                        <p className="text-[10px] font-bold text-primary truncate leading-tight group-hover/video:text-white transition-colors">
                          {video.title}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-[8px] text-muted-foreground">
                          <Clock className="h-2 w-2" />{" "}
                          {format(new Date(video.publishDate!), "p")}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" /> Upcoming
              Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-muted-foreground truncate w-2/3">
                    {v.status}: {v.title}
                  </span>
                  <span
                    className={`font-bold ${
                      isSameDay(new Date(v.deadlineDate!), new Date())
                        ? "text-red-400"
                        : "text-amber-400"
                    }`}
                  >
                    {isSameDay(new Date(v.deadlineDate!), new Date())
                      ? "Today"
                      : format(new Date(v.deadlineDate!), "MMM d")}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground">
                No upcoming deadlines.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleScheduleVideo}>
            <DialogHeader>
              <DialogTitle>Schedule New Video</DialogTitle>
              <DialogDescription>
                Add a new publishing date to your content calendar.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Video Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., My New Masterpiece"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Publish Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    required
                    defaultValue={
                      selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    defaultValue="10:00"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select name="status" defaultValue="Scheduled">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Idea">Idea</SelectItem>
                    <SelectItem value="Scripting">Scripting</SelectItem>
                    <SelectItem value="Production">Production</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Schedule Video
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
