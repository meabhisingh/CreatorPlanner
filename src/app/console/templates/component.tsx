"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FileText,
  Copy,
  Trash2,
  Layout,
  Info,
  CheckCircle2,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Template } from "@/generated/prisma/browser";
import {
  createTemplateAction,
  deleteTemplateAction,
  incrementTemplateUsageAction,
} from "./actions";

export const TemplatesComponent = ({
  initialTemplates,
}: {
  initialTemplates: Template[];
}) => {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleCreateTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const structureStr = formData.get("structure") as string;

    const structure = structureStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await createTemplateAction(name, description, structure);

    if (res.success && res.template) {
      setTemplates([res.template, ...templates]);
      setIsDialogOpen(false);
      toast({
        title: "Template Created",
        description: `"${name}" has been added to your library.`,
      });
    } else {
      toast({
        title: "Error",
        description: res.message || "Failed to create template.",
        variant: "destructive",
      });
    }
  };

  const handleCopyTemplate = async (template: Template) => {
    const copyName = `${template.name} (Copy)`;
    const structure = template.structure as string[];

    const res = await createTemplateAction(
      copyName,
      template.description || "",
      structure,
    );

    if (res.success && res.template) {
      setTemplates([res.template, ...templates]);
      toast({
        title: "Template Duplicated",
        description: `Created a copy of "${template.name}".`,
      });
    } else {
      toast({
        title: "Error",
        description: res.message || "Failed to duplicate template.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    const res = await deleteTemplateAction(id);
    if (res.success) {
      setTemplates(templates.filter((t) => t.id !== id));
      toast({
        variant: "destructive",
        title: "Template Deleted",
        description: "The template has been removed from your library.",
      });
    } else {
      toast({
        title: "Error",
        description: res.message || "Failed to delete template.",
        variant: "destructive",
      });
    }
  };

  const handleUseTemplate = async (template: Template) => {
    toast({
      title: "Applying Template",
      description: `Framework "${template.name}" is being initialized in your pipeline.`,
    });

    // Increment Usage score asynchronously
    incrementTemplateUsageAction(template.id);

    // Navigate to pipeline with template details
    const params = new URLSearchParams();
    params.set("templateId", template.id);
    router.push(`/console/ideas?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Planning Templates
          </h1>
          <p className="text-muted-foreground">
            Standardize your production process with reusable frameworks.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((t) => {
          const structure = t.structure as string[];
          return (
            <Card
              key={t.id}
              className="glass-card flex flex-col group border-none hover:shadow-primary/5 transition-all shadow-lg"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-[10px] bg-secondary border-none"
                  >
                    Used {t.usage} times
                  </Badge>
                </div>
                <CardTitle className="text-xl mt-4 group-hover:text-primary transition-colors">
                  {t.name}
                </CardTitle>
                <CardDescription className="min-h-[40px] line-clamp-2">
                  {t.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <Layout className="h-3 w-3" /> Framework Stages
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {structure.map((s) => (
                      <Badge
                        key={s}
                        variant="outline"
                        className="text-[10px] border-border bg-secondary/30"
                      >
                        {s}
                      </Badge>
                    ))}
                    {structure.length === 0 && (
                      <span className="text-xs text-muted-foreground italic">
                        No stages defined
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="gap-2 pt-0">
                <Button
                  className="flex-1 text-xs h-9"
                  onClick={() => handleUseTemplate(t)}
                >
                  <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Use This
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => handleCopyTemplate(t)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDeleteTemplate(t.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}

        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-xl p-8 hover:bg-secondary/20 hover:border-primary/50 transition-all group min-h-[250px]"
        >
          <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-300">
            <Plus className="h-6 w-6" />
          </div>
          <span className="font-semibold text-muted-foreground group-hover:text-foreground">
            New Custom Template
          </span>
          <p className="text-xs text-muted-foreground/60 mt-2">
            Build your own content framework
          </p>
        </button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreateTemplate}>
            <DialogHeader>
              <DialogTitle>Create Framework Template</DialogTitle>
              <DialogDescription>
                Define a reusable structure for your video production.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Tech Review 2024"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Short Description</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Who is this for?"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="structure">
                  Framework Stages (Comma Separated)
                </Label>
                <Textarea
                  id="structure"
                  name="structure"
                  placeholder="Hook, Intro, Core Content, Outro"
                  required
                  className="min-h-[100px]"
                />
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" /> Separate each stage of your
                  outline with a comma.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">
                Save Template
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
