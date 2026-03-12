"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Layers,
  MoreVertical,
  Trash2,
  CheckCircle2,
  Circle,
  X,
  Pencil,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Series, Video } from "@/generated/prisma/browser";
import { useRouter } from "next/navigation";
import {
  createSeriesAction,
  deleteSeriesAction,
  updateSeriesAction,
  createSeriesEpisodeAction,
  removeVideoFromSeriesAction,
  toggleVideoStatusAction,
} from "./actions";

type SeriesWithVideos = Series & {
  _count?: { videos: number };
  videos: Pick<
    Video,
    "id" | "title" | "status" | "thumbnailIdea" | "thumbnailKey"
  >[];
};

export const SeriesComponent = ({
  initialSeries,
}: {
  initialSeries: SeriesWithVideos[];
}) => {
  const [seriesList, setSeriesList] =
    useState<SeriesWithVideos[]>(initialSeries);
  const [isNewSeriesOpen, setIsNewSeriesOpen] = useState(false);
  const [isEditSeriesOpen, setIsEditSeriesOpen] = useState(false);
  const [activeSeriesId, setActiveSeriesId] = useState<string | null>(null);
  const [activeSeriesData, setActiveSeriesData] =
    useState<SeriesWithVideos | null>(null);
  const [isNewEpisodeOpen, setIsNewEpisodeOpen] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const handleCreateSeries = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    const res = await createSeriesAction(name, description);

    if (res.success && res.series) {
      setSeriesList([{ ...res.series, videos: [], _count: { videos: 0 } }, ...seriesList]);
      setIsNewSeriesOpen(false);
      toast({
        title: "Series Created",
        description: `"${name}" has been successfully added to your collections.`,
      });
    } else {
      toast({
        title: "Error",
        description: res.message || "Failed to create series.",
        variant: "destructive",
      });
    }
  };

  const handleEditSeries = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeSeriesId) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    const res = await updateSeriesAction(activeSeriesId, { name, description });

    if (res.success && res.series) {
      setSeriesList((prev) =>
        prev.map((s) => (s.id === activeSeriesId ? { ...s, ...res.series } : s)),
      );
      setIsEditSeriesOpen(false);
      setActiveSeriesId(null);
      toast({
        title: "Series Updated",
        description: `"${name}" has been successfully updated.`,
      });
    } else {
      toast({
        title: "Error",
        description: res.message || "Failed to update series.",
        variant: "destructive",
      });
    }
  };

  const deleteSeries = async (id: string) => {
    if (!confirm("Are you sure you want to delete this series?")) return;

    const res = await deleteSeriesAction(id);
    if (res.success) {
      setSeriesList((prev) => prev.filter((s) => s.id !== id));
      toast({
        variant: "destructive",
        title: "Series Deleted",
        description: "The series has been removed.",
      });
    } else {
      toast({
        title: "Error",
        description: res.message || "Failed to delete series.",
        variant: "destructive",
      });
    }
  };

  const handleAddEpisode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeSeriesId) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;

    const res = await createSeriesEpisodeAction(activeSeriesId, title);

    if (res.success && res.video) {
      setIsNewEpisodeOpen(false);
      setActiveSeriesId(null);
      toast({
        title: "Episode Created",
        description: `"${title}" has been added to the series.`,
      });
      router.push(`/console/video/${res.video.id}`);
    } else {
      toast({
        title: "Error",
        description: res.message || "Failed to create episode.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveEpisode = async (seriesId: string, videoId: string) => {
    const res = await removeVideoFromSeriesAction(videoId);
    if (res.success) {
      setSeriesList((prev) =>
        prev.map((s) => {
          if (s.id !== seriesId) return s;
          return {
            ...s,
            videos: s.videos.filter((v) => v.id !== videoId),
            _count: { videos: (s._count?.videos || 1) - 1 },
          };
        }),
      );
      toast({
        title: "Episode Removed",
        description: "The video has been removed from this series.",
      });
    } else {
      toast({
        title: "Error",
        description: res.message || "Failed to remove episode.",
        variant: "destructive",
      });
    }
  };

  const toggleEpisodeStatus = async (
    seriesId: string,
    videoId: string,
    currentStatus: string,
  ) => {
    const targetStatus = currentStatus === "Published" ? "Script" : "Published";
    
    // Optimistic UI update
    setSeriesList((prev) =>
      prev.map((s) => {
        if (s.id !== seriesId) return s;
        return {
          ...s,
          videos: s.videos.map((v) =>
            v.id === videoId ? { ...v, status: targetStatus } : v,
          ),
        };
      }),
    );

    const res = await toggleVideoStatusAction(videoId, currentStatus);

    if (!res.success) {
      // Revert on failure
      setSeriesList((prev) =>
        prev.map((s) => {
          if (s.id !== seriesId) return s;
          return {
            ...s,
            videos: s.videos.map((v) =>
              v.id === videoId ? { ...v, status: currentStatus } : v,
            ),
          };
        }),
      );
      toast({
        title: "Error",
        description: res.message || "Failed to toggle status.",
        variant: "destructive",
      });
    }
  };

  const calculateProgress = (videos: SeriesWithVideos["videos"]) => {
    if (videos.length === 0) return 0;
    const completed = videos.filter((v) => v.status === "Published").length;
    return Math.round((completed / videos.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Series Planning</h1>
          <p className="text-muted-foreground">
            Manage multi-episode content collections and track serial progress.
          </p>
        </div>
        <Button onClick={() => setIsNewSeriesOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Series
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {seriesList.map((s) => (
          <Card
            key={s.id}
            className="glass-card flex flex-col group border-none shadow-lg"
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start mb-2">
                <div className="bg-primary/20 p-2 rounded-lg text-primary">
                  <Layers className="h-5 w-5" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setActiveSeriesId(s.id);
                        setIsNewEpisodeOpen(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Episode
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setActiveSeriesId(s.id);
                        setActiveSeriesData(s);
                        setIsEditSeriesOpen(true);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Edit Series
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => deleteSeries(s.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Series
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                {s.name}
              </CardTitle>
              <CardDescription className="line-clamp-2 h-10">
                {s.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              <div className="space-y-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground font-medium">
                    Production Progress (Based on {s._count?.videos || 0} Videos)
                  </span>
                  <span className="font-bold">
                    {calculateProgress(s.videos)}%
                  </span>
                </div>
                <Progress value={calculateProgress(s.videos)} className="h-2" />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Recent Episodes
                </p>
                {s.videos.map((video) => (
                  <div
                    key={video.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer group/episode ${
                      video.status === "Published"
                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500/80"
                        : "bg-secondary/40 border-border/50 hover:bg-secondary/60"
                    }`}
                    onClick={() => toggleEpisodeStatus(s.id, video.id, video.status)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      {video.status === "Published" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 shrink-0" />
                      )}
                      <span className="text-xs font-medium truncate">
                        {video.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[8px] h-4 leading-[0.6rem] uppercase ${
                          video.status === "Published"
                            ? "border-emerald-500/30 text-emerald-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        {video.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover/episode:opacity-100 transition-opacity hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveEpisode(s.id, video.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {s.videos.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-border/20 rounded-xl">
                    <p className="text-xs text-muted-foreground">
                      No episodes added yet
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        setActiveSeriesId(s.id);
                        setIsNewEpisodeOpen(true);
                      }}
                      className="mt-1 h-auto py-1"
                    >
                      Create Episode
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                variant="secondary"
                className="w-full text-xs h-9"
                onClick={() => {
                  setActiveSeriesId(s.id);
                  setIsNewEpisodeOpen(true);
                }}
              >
                <Plus className="mr-2 h-3.5 w-3.5" /> Add Episode
              </Button>
            </CardFooter>
          </Card>
        ))}

        <button
          onClick={() => setIsNewSeriesOpen(true)}
          className="flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-xl p-8 hover:bg-secondary/20 hover:border-primary/50 transition-all group min-h-[400px]"
        >
          <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-300">
            <Plus className="h-8 w-8" />
          </div>
          <span className="font-semibold text-muted-foreground group-hover:text-foreground">
            Start New Series
          </span>
          <p className="text-xs text-muted-foreground/60 mt-2">
            Group related content together
          </p>
        </button>
      </div>

      {/* New Series Dialog */}
      <Dialog open={isNewSeriesOpen} onOpenChange={setIsNewSeriesOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreateSeries}>
            <DialogHeader>
              <DialogTitle>Create New Series</DialogTitle>
              <DialogDescription>
                Organize your content into a multi-part collection.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Series Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Mastering Next.js 15"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="What is this series about?"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">
                Initialize Series
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Series Dialog */}
      <Dialog open={isEditSeriesOpen} onOpenChange={setIsEditSeriesOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleEditSeries}>
            <DialogHeader>
              <DialogTitle>Edit Series</DialogTitle>
              <DialogDescription>
                Update the metadata for this series.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Series Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={activeSeriesData?.name || ""}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={activeSeriesData?.description || ""}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Episode Dialog */}
      <Dialog open={isNewEpisodeOpen} onOpenChange={setIsNewEpisodeOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleAddEpisode}>
            <DialogHeader>
              <DialogTitle>Add New Episode</DialogTitle>
              <DialogDescription>
                Add a new part to your series collection.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Episode Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Part 1: The Basics"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">
                Add to Series
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
