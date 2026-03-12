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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Idea } from "@/generated/prisma/browser";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "@/lib/auth/client";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
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
import {
  EyeIcon,
  Filter,
  GripVertical,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Tag,
  Trash,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SiGooglegemini } from "react-icons/si";
import {
  createIdea,
  deleteIdea,
  generateDescriptionAction,
  generateIdeaAction,
  updateIdeaStatus,
} from "./actions";
import { statusStages } from "./constants";

function SortableIdeaCard({
  idea,
  deleteHandler,
}: {
  idea: Idea;
  deleteHandler: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: idea.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [open, setOpen] = useState(false);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="glass-card group cursor-default"
      {...attributes}
    >
      <CardHeader className="p-4 pb-2 space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-primary transition-colors p-1"
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] uppercase border-none px-0 ${
                idea.priority === "High"
                  ? "text-red-400"
                  : idea.priority === "Medium"
                    ? "text-amber-400"
                    : "text-emerald-400"
              }`}
            >
              {idea.priority} Priority
            </Badge>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40">
              <div className="flex flex-col gap-2">
                <Button variant={"secondary"} onClick={() => setOpen(true)}>
                  <EyeIcon />
                  View
                </Button>

                <Button
                  variant={"destructive"}
                  onClick={() => deleteHandler(idea.id)}
                >
                  <Trash />
                  Delete
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="w-[500px] max-h-[90vh] overflow-y-auto max-w-full p-6  bg-card  rounded-lg shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold mb-1">
                  {idea.title}
                </DialogTitle>
                <DialogDescription className="mb-4">
                  Created on {new Date(idea.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* User & Status */}
                <div className="flex justify-between items-center">
                  <span className="text-sm ">User ID: {idea.userId}</span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      idea.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : idea.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {idea.status}
                  </span>
                </div>

                {/* Description */}
                {idea.description && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Description</h4>
                    <p className="text-muted-foreground ">{idea.description}</p>
                  </div>
                )}

                {/* Tags */}
                {idea.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {idea.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-secondary text-primary text-xs font-medium px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Priority */}
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold">Priority:</h4>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      idea.priority === "High"
                        ? "bg-red-100 text-red-800"
                        : idea.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {idea.priority}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setOpen(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardTitle className="text-sm font-semibold leading-snug">
          {idea.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-1 mt-2">
          {idea.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground capitalize"
            >
              <Tag className="h-2 w-2" /> {tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DroppableColumn({
  stage,
  stageIdeas,
  stageIdeaIds,
  onOpenAddDialog,
  deleteHandler,
}: {
  stage: string;
  stageIdeas: Idea[];
  stageIdeaIds: string[];
  onOpenAddDialog: (stage: string) => void;
  deleteHandler: (id: string) => void;
}) {
  // Register this column as a droppable zone
  const { setNodeRef } = useDroppable({
    id: stage,
  });

  return (
    <div className="w-80 flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            {stage}
          </h3>
          <Badge
            variant="secondary"
            className="h-5 rounded-full px-2 text-[10px]"
          >
            {stageIdeas.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onOpenAddDialog(stage)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <SortableContext
        id={stage}
        items={stageIdeaIds}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef} // <-- Attach the droppable ref here!
          className="flex flex-col gap-4 bg-secondary/10 p-3  border border-border/50 min-h-[500px]"
        >
          {stageIdeas.map((idea) => (
            <SortableIdeaCard
              key={idea.id}
              idea={idea}
              deleteHandler={deleteHandler}
            />
          ))}
          {stageIdeas.length === 0 && (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border/30 rounded-lg h-32 pointer-events-none">
              <p className="text-xs text-muted-foreground/50">
                Drop ideas here
              </p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export const IdeaVaultComponent = ({
  initialIdeas,
  templates,
}: {
  initialIdeas: Idea[];
  templates: any[];
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateIdParam = searchParams.get("templateId");

  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addingToStage, setAddingToStage] = useState<string>("Idea");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("none");

  const [aiLoading, setAiLoading] = useState(false);
  const { toast } = useToast();

  const [idea, setIdea] = useState({
    title: "",
    description: "",
    niche: "",
    priority: "Medium",
  });

  useEffect(() => {
    if (templateIdParam) {
      const t = templates.find((t) => t.id === templateIdParam);
      if (t) {
        setSelectedTemplateId(t.id);
        setAddingToStage("Idea");
        setIsDialogOpen(true);
        const structureText = (t.structure as string[])
          .map((s) => `- ${s}`)
          .join("\n");
        setIdea((prev) => ({
          ...prev,
          description: `**${t.name} Outline**\n${structureText}\n\n`,
        }));
      }

      // Clear the query parameter so it doesn't re-open on refresh
      const params = new URLSearchParams(searchParams.toString());
      params.delete("templateId");
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [templateIdParam, templates, searchParams, router]);

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

  const filteredIdeas = useMemo(() => {
    return ideas.filter(
      (idea) =>
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.niche?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [ideas, searchTerm]);

  // Memoize grouped ideas and their IDs to prevent infinite loops with SortableContext
  const groupedData = useMemo(() => {
    const ideasByStage: Record<string, Idea[]> = {};
    const idsByStage: Record<string, string[]> = {};

    statusStages.forEach((stage) => {
      const stageIdeas = filteredIdeas.filter((i) => i.status === stage);
      ideasByStage[stage] = stageIdeas;
      idsByStage[stage] = stageIdeas.map((i) => i.id);
    });

    return { ideasByStage, idsByStage };
  }, [filteredIdeas]);

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeIndex = ideas.findIndex((i) => i.id === activeId);
    const overIndex = ideas.findIndex((i) => i.id === overId);

    const activeItem = ideas[activeIndex];
    // overItem might be undefined if hovering over an empty column
    const overItem = overIndex >= 0 ? ideas[overIndex] : undefined;

    // 1. Hovering directly over an empty column's drop zone
    if (statusStages.includes(overId)) {
      if (activeItem.status !== overId) {
        setIdeas((prev) => {
          const updatedItems = [...prev];
          updatedItems[activeIndex] = { ...activeItem, status: overId };
          // Move to the very end of the array so it drops neatly into the empty space
          return arrayMove(updatedItems, activeIndex, updatedItems.length - 1);
        });
      }
      return;
    }

    // 2. Hovering over another item in a DIFFERENT column
    if (overItem && activeItem.status !== overItem.status) {
      setIdeas((prev) => {
        const updatedItems = [...prev];
        // Update the status of the dragged item
        updatedItems[activeIndex] = { ...activeItem, status: overItem.status };

        // Move the item to the exact index of the item we are hovering over
        // This prevents the "teleporting" jump!
        return arrayMove(updatedItems, activeIndex, overIndex);
      });
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Get the idea that was dragged
    const draggedIdea = ideas.find((i) => i.id === activeId);
    if (!draggedIdea) return;

    if (activeId !== overId) {
      setIdeas((items) => {
        const oldIndex = items.findIndex((i) => i.id === activeId);
        const newIndex = items.findIndex((i) => i.id === overId);

        if (newIndex !== -1) {
          return arrayMove(items, oldIndex, newIndex);
        }
        return items;
      });
    }

    // Save the status change to database
    if (draggedIdea.status) {
      const result = await updateIdeaStatus(activeId, draggedIdea.status);
      if (!result.success) {
        toast({
          title: "Error",
          description: "Failed to save idea status.",
          variant: "destructive",
        });
      }
    }
  }

  function openAddDialog(stage: string = "Idea") {
    setAddingToStage(stage);
    setIsDialogOpen(true);
  }

  const deleteHandler = async (id: string) => {
    const prevIdeas = [...ideas];
    setIdeas((prev) => prev.filter((idea) => idea.id !== id));

    try {
      const result = await deleteIdea(id);

      if (!result.success) {
        throw new Error("Delete failed");
      }

      toast({
        title: "Deleted",
        description: "The idea has been removed successfully.",
      });
    } catch (error) {
      // Revert optimistic update
      setIdeas(prevIdeas);

      toast({
        title: "Error",
        description: "Failed to delete idea. Please try again.",
        variant: "destructive",
      });
    }
  };

  async function handleAddNewIdea(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const { data } = await getSession();

    const user = data?.user;

    if (!user?.id) return;

    const { title, description, niche, priority } = idea;

    const newIdea: Idea = {
      id: Math.random().toString(36).substring(7),
      title,
      description,
      niche,
      priority,
      userId: user?.id,
      status: addingToStage,
      tags: niche ? niche.split(",") : [],
      createdAt: new Date(),
    };

    setIdeas((prev) => [...prev, newIdea]);
    setIsDialogOpen(false);

    try {
      const result = await createIdea(formData);

      if (!result.success) throw new Error(result.message);

      toast({
        title: "Success",
        description: `"${title}" has been added to your ${addingToStage} list.`,
      });
    } catch (error) {
      setIdeas((prev) => prev.filter((i) => i.id !== newIdea.id)); // Revert optimistic update
      toast({
        title: "Error",
        description: "Failed to create idea. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIdea({
        title: "",
        description: "",
        niche: "",
        priority: "Medium",
      });
      setSelectedTemplateId("none");
    }
  }

  const handleGenerateIdea = async () => {
    setAiLoading(true);
    const title = idea.title;

    const result = await generateIdeaAction({
      title,
      alreadyDoneIdeas: ideas.map((i) => i.title),
    });

    if (!result.success || !result.data) {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
      setAiLoading(false);
      return;
    }

    setIdea(result.data);
    setAiLoading(false);
  };

  const handleGenerateIdeaDescription = async () => {
    setAiLoading(true);
    const result = await generateDescriptionAction({ ideaTitle: idea.title });

    if (!result.success || !result.data) {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
      setAiLoading(false);
      return;
    }

    setIdea((prev) => ({ ...prev, description: result.data }));

    setAiLoading(false);
  };

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Video Idea Vault
          </h1>
          <p className="text-muted-foreground">
            Store and organize your content inspirations.
          </p>
        </div>
        <Button onClick={() => openAddDialog("Idea")}>
          <Plus className="mr-2 h-4 w-4" /> New Idea
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search ideas, niches, or tags..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Tabs defaultValue="board">
            <TabsList>
              <TabsTrigger value="board">Board</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-max">
            {statusStages.map((stage) => {
              const stageIdeas = groupedData.ideasByStage[stage];
              const stageIdeaIds = groupedData.idsByStage[stage];

              return (
                <DroppableColumn
                  key={stage}
                  stage={stage}
                  stageIdeas={stageIdeas}
                  stageIdeaIds={stageIdeaIds}
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
          {aiLoading && (
            <div className="h-full w-full absolute rounded-lg   z-50 ">
              <div className="relative h-full w-full flex flex-col items-center justify-center gap-4  rounded-lg">
                <div className="absolute inset-0 backdrop-blur-md  rounded-lg"></div>
                <p className=" flex items-center gap-2 z-10 text-white">
                  <Loader2 className="animate-spin" /> Generating
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleAddNewIdea}>
            <DialogHeader>
              <DialogTitle>
                Add New Idea{" "}
                <Button
                  type="button"
                  onClick={handleGenerateIdea}
                  variant="outline"
                  size="icon"
                  className="ml-2"
                  disabled={aiLoading}
                >
                  <SiGooglegemini />
                </Button>
              </DialogTitle>
              <DialogDescription>
                Create a new content inspiration for your {addingToStage} stage.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Idea Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Why AI is changing design"
                  required
                  value={idea.title}
                  onChange={(e) =>
                    setIdea((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>

              {templates.length > 0 && (
                <div className="grid gap-2">
                  <Label htmlFor="template">
                    Start from Template (Optional)
                  </Label>
                  <Select
                    value={selectedTemplateId}
                    onValueChange={(val) => {
                      setSelectedTemplateId(val);
                      if (val !== "none") {
                        const t = templates.find((t) => t.id === val);
                        if (t) {
                          const structureText = (t.structure as string[])
                            .map((s) => `- ${s}`)
                            .join("\n");
                          setIdea((prev) => ({
                            ...prev,
                            description:
                              `**${t.name} Outline**\n${structureText}\n\n` +
                              prev.description,
                          }));
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {templates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="description">
                  Idea Description
                  <Button
                    type="button"
                    onClick={handleGenerateIdeaDescription}
                    variant="outline"
                    size="icon"
                    className="ml-2"
                    disabled={aiLoading}
                  >
                    <SiGooglegemini />
                  </Button>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Optional: Add more details about this idea..."
                  value={idea.description}
                  onChange={(e) =>
                    setIdea((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="niche">Niche</Label>
                <Input
                  id="niche"
                  name="niche"
                  placeholder="e.g., Tech, Lifestyle"
                  required
                  value={idea.niche}
                  onChange={(e) =>
                    setIdea((prev) => ({ ...prev, niche: e.target.value }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  name="priority"
                  defaultValue="Medium"
                  onValueChange={(val) =>
                    setIdea((prev) => ({ ...prev, priority: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create Idea</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
