"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getPublicUrl } from "@/constants/bucket";
import { Video } from "@/generated/prisma/browser";
import { useToast } from "@/hooks/use-toast";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import {
  Clock,
  EyeIcon,
  GripVertical,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Trash,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  createVideoProject,
  deleteVideoProject,
  updateVideoStatus,
} from "./actions";

const pipelineStages = [
  "Idea",
  "Research",
  "Script",
  "Recording",
  "Editing",
  "Scheduled",
  "Published",
];

function SortableProjectCard({
  project,
  deleteHandler,
}: {
  project: Video;
  deleteHandler: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="glass-card group cursor-default overflow-hidden border-none shadow-md">
        <div className="relative aspect-video w-full overflow-hidden bg-secondary">
          <Image
            src={
              project.thumbnailKey
                ? getPublicUrl(project.thumbnailKey)
                : "/assets/placeholder.png"
            }
            alt={project.title}
            width={400}
            height={200}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <div
              {...listeners}
              className="bg-black/50 p-1 rounded cursor-grab active:cursor-grabbing text-white"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          </div>
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-6 w-6 opacity-80 hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40">
                <div className="flex flex-col gap-2">
                  <Button variant={"secondary"} asChild>
                    <Link href={`/console/video/${project.id}`}>
                      <EyeIcon />
                      View
                    </Link>
                  </Button>

                  <Button
                    variant={"destructive"}
                    onClick={() => deleteHandler(project.id)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 pointer-events-none">
            <Link
              href={`/console/video/${project.id}`}
              className="text-white text-[10px] font-bold hover:underline pointer-events-auto"
            >
              View Project Details
            </Link>
          </div>
        </div>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm font-semibold line-clamp-2">
            {project.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 border-t border-border/30 pt-3">
            <span className="flex items-center gap-1 text-primary font-bold">
              <Clock className="h-2.5 w-2.5" />{" "}
              {project.deadlineDate
                ? format(new Date(project.deadlineDate), "MMM dd")
                : "TBD"}
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-2.5 w-2.5" /> 0
              </span>
              <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <User className="h-2.5 w-2.5 text-primary" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DroppableColumn({
  stage,
  stageProjects,
  stageProjectIds,
  onOpenAddDialog,
  deleteHandler,
}: {
  stage: string;
  stageProjects: Video[];
  stageProjectIds: string[];
  onOpenAddDialog: (stage: string) => void;
  deleteHandler: (id: string) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: stage,
  });

  return (
    <div className="w-72 flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {stage}
        </h3>
        <Badge
          variant="outline"
          className="border-none bg-secondary/50 text-[10px]"
        >
          {stageProjects.length}
        </Badge>
      </div>

      <SortableContext
        id={stage}
        items={stageProjectIds}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className="flex-1 flex flex-col gap-4 bg-secondary/10 p-3 rounded-xl min-h-[600px] border border-border/30"
        >
          {stageProjects.map((project) => (
            <SortableProjectCard
              key={project.id}
              project={project}
              deleteHandler={deleteHandler}
            />
          ))}

          <Button
            variant="ghost"
            onClick={() => onOpenAddDialog(stage)}
            className="w-full border-2 border-dashed border-border/30 h-16 hover:bg-secondary/20 hover:border-primary/50 text-muted-foreground text-xs"
          >
            <Plus className="mr-2 h-3 w-3" /> Add Project
          </Button>

          {stageProjects.length === 0 && (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border/10 rounded-lg min-h-[100px] pointer-events-none">
              <p className="text-[10px] text-muted-foreground/30">
                Drop projects here
              </p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export const PipelineComponent = ({
  initialProjects,
  userId,
}: {
  initialProjects: Video[];
  userId: string;
}) => {
  const [projects, setProjects] = useState<Video[]>(initialProjects);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addingToStage, setAddingToStage] = useState<string>("Idea");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const groupedData = useMemo(() => {
    const projectsByStage: Record<string, Video[]> = {};
    const idsByStage: Record<string, string[]> = {};

    pipelineStages.forEach((stage) => {
      const stageProjects = projects.filter((p) => p.status === stage);
      projectsByStage[stage] = stageProjects;
      idsByStage[stage] = stageProjects.map((p) => p.id);
    });

    return { projectsByStage, idsByStage };
  }, [projects]);

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeItem = projects.find((p) => p.id === activeId);
    if (!activeItem) return;

    // 1. Hovering directly over an empty column's drop zone
    if (pipelineStages.includes(overId)) {
      if (activeItem.status !== overId) {
        setProjects((prev) => {
          const updatedItems = [...prev];
          const activeIndex = prev.findIndex((p) => p.id === activeId);
          updatedItems[activeIndex] = { ...activeItem, status: overId };
          // Move to the very end of the array so it drops neatly into the empty space
          return arrayMove(updatedItems, activeIndex, updatedItems.length - 1);
        });
      }
      return;
    }

    // 2. Hovering over another item in a DIFFERENT column
    const overItem = projects.find((p) => p.id === overId);
    if (overItem && activeItem.status !== overItem.status) {
      setProjects((prev) => {
        const activeIndex = prev.findIndex((p) => p.id === activeId);
        const overIndex = prev.findIndex((p) => p.id === overId);

        const updatedItems = [...prev];
        // Update the status of the dragged item
        updatedItems[activeIndex] = { ...activeItem, status: overItem.status };

        // Move the item to the exact index of the item we are hovering over
        return arrayMove(updatedItems, activeIndex, overIndex);
      });
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Get the dragged video
    const draggedVideo = projects.find((p) => p.id === activeId);
    if (!draggedVideo) return;

    if (activeId !== overId) {
      setProjects((items) => {
        const oldIndex = items.findIndex((i) => i.id === activeId);
        const newIndex = items.findIndex((i) => i.id === overId);

        if (newIndex !== -1) {
          return arrayMove(items, oldIndex, newIndex);
        }
        return items;
      });
    }

    // Save status change
    if (draggedVideo.status) {
      const result = await updateVideoStatus(activeId, draggedVideo.status);
      if (!result.success) {
        toast({
          title: "Error",
          description: "Failed to save project status.",
          variant: "destructive",
        });
      }
    }
  }

  function openAddDialog(stage: string = "Research") {
    setAddingToStage(stage);
    setIsDialogOpen(true);
  }

  async function handleAddProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("stage", addingToStage);

    const title = formData.get("title") as string;
    const deadline = formData.get("deadline") as string;

    // Optimistic Update
    const optimisticVideo: Video = {
      id: Math.random().toString(36).substring(7),
      title,
      status: addingToStage,
      deadlineDate: deadline ? new Date(deadline) : null,
      thumbnailIdea: null,
      thumbnailKey: null,
      description: null,
      hook: null,
      scriptOutline: null,
      publishDate: null,
      targetAudience: null,
      notes: null,
      seriesId: null,
      tags: [],
      keywords: [],
      userId,
      createdAt: new Date(),
    };

    setProjects((prev) => [...prev, optimisticVideo]);
    setIsDialogOpen(false);

    try {
      const result = await createVideoProject(formData);
      if (!result.success || !result.video) {
        throw new Error("Failed to create");
      }

      // Replace optimistic video with real video from db
      setProjects((prev) =>
        prev.map((p) => (p.id === optimisticVideo.id ? result.video : p)),
      );

      toast({
        title: "Project Started",
        description: `"${title}" has been added to the ${addingToStage} stage.`,
      });
    } catch (error) {
      // Revert optimistic update
      setProjects((prev) => prev.filter((p) => p.id !== optimisticVideo.id));
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const deleteHandler = async (id: string) => {
    const prevProjects = [...projects];
    setProjects((prev) => prev.filter((project) => project.id !== id));

    try {
      const result = await deleteVideoProject(id);

      if (!result.success) {
        throw new Error("Delete failed");
      }

      toast({
        title: "Deleted",
        description: "The video project has been removed successfully.",
      });
    } catch (error) {
      // Revert optimistic update
      setProjects(prevProjects);

      toast({
        title: "Error",
        description: "Failed to delete video project. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Production Pipeline
          </h1>
          <p className="text-muted-foreground">
            Monitor your video production workflow from start to finish.
          </p>
        </div>
        <Button onClick={() => openAddDialog("Research")}>
          <Plus className="mr-2 h-4 w-4" /> Start New Project
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto pb-6">
          <div className="flex gap-6 min-w-max">
            {pipelineStages.map((stage) => {
              const stageProjects = groupedData.projectsByStage[stage] || [];
              const stageProjectIds = groupedData.idsByStage[stage] || [];

              return (
                <DroppableColumn
                  key={stage}
                  stage={stage}
                  stageProjects={stageProjects}
                  stageProjectIds={stageProjectIds}
                  onOpenAddDialog={openAddDialog}
                  deleteHandler={deleteHandler}
                />
              );
            })}
          </div>
        </div>
      </DndContext>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleAddProject}>
            <DialogHeader>
              <DialogTitle>Start New Project</DialogTitle>
              <DialogDescription>
                Initiate a new video project in the {addingToStage} stage.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Mastering React Hooks"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deadline">Target Deadline</Label>
                <Input type="date" id="deadline" name="deadline" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Initialize Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
