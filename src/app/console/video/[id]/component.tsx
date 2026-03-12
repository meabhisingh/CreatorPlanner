"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPublicUrl } from "@/constants/bucket";
import { Task, Video } from "@/generated/prisma/browser";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Calendar,
  CheckSquare,
  Clock,
  ImageIcon,
  Plus,
  Save,
  Share2,
  Tag,
  Target,
  Trash2,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUpload } from "upload-with-progress";
import {
  createTask,
  deleteTaskAction,
  deleteVideoAction,
  thumbnailUploadAction,
  toggleTaskCompletion,
  updateVideoDetails,
} from "./actions";

type VideoWithTasks = Video & { tasks: Task[] };

export const VideoPlanningComponent = ({
  initialVideo,
  seriesList,
}: {
  initialVideo: VideoWithTasks;
  seriesList: { id: string; name: string }[];
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const [video, setVideo] = useState<VideoWithTasks>(initialVideo);
  const [tasks, setTasks] = useState<Task[]>(initialVideo.tasks);
  const [newTaskName, setNewTaskName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Editable fields
  const [title, setTitle] = useState(video.title || "");
  const [targetAudience, setTargetAudience] = useState(
    video.targetAudience || "",
  );
  const [keywords, setKeywords] = useState(video.keywords.join(", ") || "");
  const [publishDate, setPublishDate] = useState(
    video.publishDate ? format(new Date(video.publishDate), "yyyy-MM-dd") : "",
  );
  const [hook, setHook] = useState(video.hook || "");
  const [scriptContent, setScriptContent] = useState(video.scriptOutline || "");
  const [thumbnailIdea, setThumbnailIdea] = useState(video.thumbnailIdea || "");
  const [seriesId, setSeriesId] = useState<string>(video.seriesId || "none");

  // Debounced Auto-Save
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      // Check if anything actually changed before saving
      if (
        title === video.title &&
        targetAudience === (video.targetAudience || "") &&
        keywords === video.keywords.join(", ") &&
        publishDate ===
          (video.publishDate
            ? format(new Date(video.publishDate), "yyyy-MM-dd")
            : "") &&
        hook === (video.hook || "") &&
        scriptContent === (video.scriptOutline || "") &&
        thumbnailIdea === (video.thumbnailIdea || "") &&
        seriesId === (video.seriesId || "none")
      ) {
        return;
      }

      setIsSaving(true);

      const payload = {
        title,
        targetAudience,
        keywords: keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        publishDate: publishDate ? new Date(publishDate) : null,
        hook,
        scriptOutline: scriptContent,
        thumbnailIdea,
        seriesId: seriesId === "none" ? null : seriesId,
      };

      const result = await updateVideoDetails(video.id, payload);

      if (result.success && result.video) {
        setVideo((prev) => ({ ...prev, ...result.video }));
      } else {
        toast({
          title: "Auto-save failed",
          description: "There was a problem syncing your changes.",
          variant: "destructive",
        });
      }
      setIsSaving(false);
    }, 1500); // Save 1.5s after user stops typing

    return () => clearTimeout(delayDebounceFn);
  }, [
    title,
    targetAudience,
    keywords,
    publishDate,
    hook,
    scriptContent,
    thumbnailIdea,
    seriesId,
    video,
    toast,
  ]);

  const toggleTask = async (id: string, currentlyCompleted: boolean) => {
    // Optimistic
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !currentlyCompleted } : t,
      ),
    );

    const result = await toggleTaskCompletion(id, !currentlyCompleted);
    if (!result.success) {
      // Revert optimistic
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, completed: currentlyCompleted } : t,
        ),
      );
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive",
      });
    }
  };

  const addTask = async () => {
    if (!newTaskName.trim()) return;

    // Optimistic UI for quick UX
    const optimisticTask: Task = {
      id: Math.random().toString(),
      videoId: video.id,
      taskName: newTaskName.trim(),
      completed: false,
    };

    setTasks((prev) => [...prev, optimisticTask]);
    const tempName = newTaskName.trim();
    setNewTaskName("");

    const result = await createTask(video.id, tempName);

    if (result.success && result.task) {
      // Replace optimistic task with db task
      setTasks((prev) =>
        prev.map((t) => (t.id === optimisticTask.id ? result.task! : t)),
      );
      toast({
        title: "Task Added",
        description: `"${tempName}" has been added.`,
      });
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== optimisticTask.id));
      toast({
        title: "Error",
        description: "Failed to add task.",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    const prevTasks = [...tasks];

    setTasks(tasks.filter((t) => t.id !== id));

    const result = await deleteTaskAction(id);
    if (!result.success) {
      setTasks(prevTasks);
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Task Deleted",
        description: `"${taskToDelete?.taskName}" has been removed.`,
      });
    }
  };

  const deleteProject = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone.",
      )
    )
      return;

    const result = await deleteVideoAction(video.id);
    if (result.success) {
      toast({
        title: "Project Deleted",
        description: "The video project was deleted successfully.",
      });
      router.push("/console/pipeline");
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to delete project.",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-3xl font-bold h-auto py-1 px-2 border-transparent hover:border-border focus-visible:ring-1 bg-transparent w-full md:w-[400px]"
            />
            <Badge className="bg-primary/20 text-primary border-none whitespace-nowrap">
              {video.status}
            </Badge>
            <Select value={seriesId} onValueChange={setSeriesId}>
              <SelectTrigger className="w-[180px] h-8 bg-secondary/30 border-dashed">
                <SelectValue placeholder="Add to Series" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="none"
                  className="text-muted-foreground italic"
                >
                  No Series
                </SelectItem>
                {seriesList.map((series) => (
                  <SelectItem key={series.id} value={series.id}>
                    {series.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-muted-foreground px-2 text-xs">
            Project ID: {video.id}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button variant="secondary" disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Saved"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="strategy" className="w-full">
            <TabsList className="w-full justify-start bg-secondary/30 p-1 h-auto mb-6">
              <TabsTrigger value="strategy" className="py-2.5 px-6">
                Strategy
              </TabsTrigger>
              <TabsTrigger value="script" className="py-2.5 px-6">
                Script Outline
              </TabsTrigger>
              <TabsTrigger value="thumbnail" className="py-2.5 px-6">
                Thumbnail & Assets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="strategy" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" /> Target
                      Audience
                    </Label>
                    <Input
                      placeholder="Who is this video for?"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" /> Keywords
                    </Label>
                    <Input
                      placeholder="SEO Keywords (comma separated)"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" /> Publish Date
                    </Label>
                    <Input
                      type="date"
                      value={publishDate}
                      onChange={(e) => setPublishDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Video Hook
                    </Label>
                    <Textarea
                      placeholder="The first 10 seconds..."
                      className="min-h-[80px]"
                      value={hook}
                      onChange={(e) => setHook(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="script" className="space-y-4">
              <RichTextEditor
                content={scriptContent}
                onChange={setScriptContent}
                placeholder="Start outlining your video script here..."
              />
            </TabsContent>

            <TabsContent value="thumbnail" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" /> Concept Idea
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      className="min-h-[150px]"
                      placeholder="Describe your thumbnail layout and text..."
                      value={thumbnailIdea}
                      onChange={(e) => setThumbnailIdea(e.target.value)}
                    />
                  </CardContent>
                </Card>
                <ImageUploader
                  videoId={video.id}
                  thumbnailKey={video.thumbnailKey}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-8">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary" /> Production
                Checklist
              </CardTitle>
              <Badge variant="outline">
                {tasks.filter((t) => t.completed).length}/{tasks.length}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 group">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() =>
                        toggleTask(task.id, task.completed)
                      }
                    />
                    <label
                      htmlFor={`task-${task.id}`}
                      className={`text-sm flex-1 cursor-pointer transition-all ${
                        task.completed
                          ? "text-muted-foreground line-through"
                          : ""
                      }`}
                    >
                      {task.taskName}
                    </label>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4 italic">
                    No tasks yet. Add one below!
                  </p>
                )}
              </div>
              <div className="pt-4 border-t flex gap-2">
                <Input
                  placeholder="Add task..."
                  className="h-8 text-xs"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8"
                  onClick={addTask}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Key Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Target Deadline</span>
                <Badge variant="secondary" className="font-mono">
                  {video.deadlineDate
                    ? format(new Date(video.deadlineDate), "MMM dd")
                    : "TBD"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Publish Date</span>
                <Badge
                  variant="outline"
                  className="font-mono border-primary text-primary"
                >
                  {video.publishDate
                    ? format(new Date(video.publishDate), "MMM dd")
                    : "TBD"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card bg-destructive/10 border-destructive/20">
            <CardHeader>
              <CardTitle className="text-sm text-destructive font-bold uppercase tracking-widest">
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={deleteProject}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Project
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ImageUploader = ({
  videoId,
  thumbnailKey,
}: {
  videoId: string;
  thumbnailKey: string | null;
}) => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    thumbnailKey ? getPublicUrl(thumbnailKey) : null,
  );

  console.log("preview", imagePreview);
  const [isDragging, setIsDragging] = useState(false);

  const { upload, isUploading, progress, abort, error } = useUpload<{
    thumbnailKey: string;
  }>();

  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleUploadClick = () => {
    const input = document.getElementById("thumbnail");
    if (input) {
      input.click();
    }
  };

  const handleUpload = async () => {
    if (!image) return;

    const uploadedMeta = await upload(image, async () => {
      const { success, url, message, thumbnailKey } =
        await thumbnailUploadAction(videoId, image.type);

      if (!success || !url) {
        toast({
          title: "Error",
          description: message || "Failed to upload thumbnail",
          variant: "destructive",
        });
        throw new Error(message);
      }

      return {
        meta: {
          thumbnailKey,
        },
        presignedUrl: url,
      };
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        onClick={handleUploadClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`cursor-pointer aspect-video group bg-secondary/50 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden relative transition-colors ${
          isDragging ? "border-primary bg-primary/10" : ""
        }`}
      >
        {imagePreview && (
          <Image
            width={400}
            height={200}
            src={imagePreview}
            alt="Thumbnail Mockup"
            className="w-full h-full object-cover  group-hover:opacity-50 transition-opacity"
          />
        )}

        <input
          type="file"
          name="thumbnail"
          id="thumbnail"
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <div className=" group-hover:opacity-100 opacity-0  absolute flex flex-col items-center justify-center text-muted-foreground text-xs pointer-events-none">
          <ImageIcon className="mx-auto h-8 w-8 mb-2" />
          {isDragging
            ? "Drop image here"
            : imagePreview
              ? "Change Thumbnail"
              : "Upload Thumbnail"}
        </div>
      </div>

      {image && !isUploading && <Button onClick={handleUpload}>Upload</Button>}

      {error && <p className="text-destructive">{error}</p>}
      {isUploading && (
        <div className="flex items-center gap-4">
          <Progress value={progress} className="h-2" />
          <span className="text-sm">{progress}%</span>
          <button className="bg-destructive rounded-full p-1" onClick={abort}>
            <XIcon className="h-4 w-4 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};
