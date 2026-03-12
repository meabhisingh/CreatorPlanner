"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, Save, Loader2, Wand2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateVideoIdeasAction, saveGeneratedIdeaAction } from "./actions";

interface VideoIdea {
  title: string;
  description: string;
  thumbnailConcept: string;
}

export default function AIGeneratorComponent() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VideoIdea[] | null>(null);
  const [currentNiche, setCurrentNiche] = useState("");
  const [savedIdeas, setSavedIdeas] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const niche = formData.get("niche") as string;
      setCurrentNiche(niche);
      setSavedIdeas(new Set());

      const result = await generateVideoIdeasAction({
        channelNiche: niche,
        targetAudience: formData.get("audience") as string,
        videoType: formData.get("type") as string,
      });

      if (!result.success || !result.data) {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return;
      }

      setResults(result.data);
      toast({
        title: "Success!",
        description: "Generated unique video ideas for your channel.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate ideas. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  const saveIdea = async (idea: VideoIdea, index: number) => {
    try {
      const formattedDescription = `${idea.description}\n\n**Thumbnail Concept:**\n${idea.thumbnailConcept}`;

      const result = await saveGeneratedIdeaAction(
        idea.title,
        formattedDescription,
        currentNiche,
      );

      if (result.success) {
        setSavedIdeas(new Set(savedIdeas).add(index));
        toast({
          title: "Idea Saved",
          description: `"${idea.title}" has been added to your Idea Vault.`,
        });
      } else {
        throw new Error(result.message || "Failed to save");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save the idea.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary mb-4">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          AI Content Strategist
        </h1>
        <p className="text-muted-foreground text-lg">
          Generate high-performing YouTube video ideas tailored to your niche.
        </p>
      </div>

      <Card className="glass-card">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Generator Parameters</CardTitle>
            <CardDescription>
              Tell us about your channel and the type of content you want to
              create.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="niche">Channel Niche</Label>
              <Input
                id="niche"
                name="niche"
                placeholder="e.g., Tech Reviews, Cooking"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                name="audience"
                placeholder="e.g., Aspiring developers"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Video Type</Label>
              <Select name="type" defaultValue="tutorial">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                  <SelectItem value="documentary">Documentary</SelectItem>
                  <SelectItem value="reaction">Reaction</SelectItem>
                  <SelectItem value="vlog">Vlog</SelectItem>
                  <SelectItem value="listicle">Listicle / Top 10</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              {loading ? "Thinking..." : "Generate Ideas"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {results && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          <h2 className="text-2xl font-bold mt-8 flex items-center gap-2">
            Generated Results <Sparkles className="h-5 w-5 text-primary" />
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {results.map((idea, idx) => (
              <Card key={idx} className="glass-card flex flex-col h-full group">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {idea.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {idea.description}
                  </p>
                  <div className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Thumbnail Concept
                    </p>
                    <p className="text-sm italic">{idea.thumbnailConcept}</p>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    variant={savedIdeas.has(idx) ? "secondary" : "outline"}
                    className={`w-full transition-all ${!savedIdeas.has(idx) && "group-hover:bg-primary group-hover:text-primary-foreground"}`}
                    onClick={() => saveIdea(idea, idx)}
                    disabled={savedIdeas.has(idx)}
                  >
                    {savedIdeas.has(idx) ? (
                      <>
                        <Check className="mr-2 h-4 w-4 text-green-500" /> Saved
                        to Vault
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Save to Vault
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
