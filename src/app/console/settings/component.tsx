"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { getPublicUrl } from "@/constants/bucket";
import { useToast } from "@/hooks/use-toast";
import { signOut, useSession } from "@/lib/auth/client";
import { Loader2, Save, XIcon } from "lucide-react";
import React, { useState } from "react";
import {
  deleteAccountAction,
  deleteOpenAPIKey,
  saveChannelSettings,
  saveNotificationSettingsAction,
  saveOpenAPIKey,
} from "./actions";

export const ProfileForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  const { data: sessionData } = useSession();

  const user = sessionData?.user;

  if (!user) return null;

  return (
    <form className="space-y-6">
      <div className="flex items-center gap-6">
        <Avatar className="h-20 w-20 border-2 border-primary/20">
          <AvatarImage src={user.image ? getPublicUrl(user.image) : ""} />
          <AvatarFallback>
            {user?.name?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() =>
            toast({
              title: "This feature yet to implement",
            })
          }
        >
          Change Avatar
        </Button>
      </div>

      <Badge variant={"secondary"}>
        {user.emailVerified ? "Verified" : "Not Verified"}
      </Badge>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" defaultValue={user.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" defaultValue={user.email} />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button type="submit" disabled={isLoading} className="px-8">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export const APIForm = ({ savedKey }: { savedKey?: string | null }) => {
  const [isLoading, setIsLoading] = useState(false);

  const [key, setKey] = useState(savedKey || "");

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    let backup = key;
    try {
      setKey("");
      const result = await saveOpenAPIKey(key);

      if (!result.success || !result.encryptedKey) {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return;
      }

      setKey(result.encryptedKey);
    } catch (error) {
      setKey(backup);
    } finally {
      setIsLoading(false);
    }
  };

  const removeHandler = async () => {
    const result = await deleteOpenAPIKey();

    if (!result.success) {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
      return;
    }

    setKey("");
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="openai">OPENAI API</Label>

          <div className="flex gap-2 items-center">
            <Input
              id="openai"
              defaultValue={savedKey || ""}
              placeholder="Enter OpenAI API key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
            <button
              className="hover:text-red-400"
              type="button"
              onClick={() => removeHandler()}
            >
              <XIcon />
            </button>
          </div>

          <span className="text-muted-foreground text-xs">
            This key will be encrypted
          </span>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button type="submit" disabled={isLoading} className="px-8">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export const ChannelForm = ({ initialData }: { initialData?: any }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("channelName") as string,
      handle: formData.get("handle") as string,
      description: formData.get("description") as string,
      primaryNiche: formData.get("primaryNiche") as string,
      uploadFrequency: formData.get("uploadFrequency") as
        | "Daily"
        | "Twice_a_week"
        | "Weekly"
        | "Monthly",
      language: formData.get("language") as string,
      country: formData.get("country") as string,
    };

    try {
      const result = await saveChannelSettings(data);
      if (result.success) {
        toast({
          title: "Success",
          description: "Channel settings saved successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="channelName">Channel Name</Label>
        <Input
          id="channelName"
          name="channelName"
          defaultValue={initialData?.name || ""}
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="handle">Handle</Label>
          <Input
            id="handle"
            name="handle"
            defaultValue={initialData?.handle || ""}
            placeholder="@"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            defaultValue={initialData?.country || ""}
            placeholder="e.g. US"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          defaultValue={initialData?.description || ""}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="primaryNiche">Primary Niche</Label>
          <Select
            name="primaryNiche"
            defaultValue={initialData?.primaryNiche || "tech"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Niche" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tech">Technology</SelectItem>
              <SelectItem value="lifestyle">Lifestyle</SelectItem>
              <SelectItem value="gaming">Gaming</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="cooking">Cooking</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="uploadFrequency">Upload Frequency</Label>
          <Select
            name="uploadFrequency"
            defaultValue={initialData?.uploadFrequency || "Weekly"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Daily">Daily</SelectItem>
              <SelectItem value="Twice_a_week">Twice a week</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Input
            id="language"
            name="language"
            defaultValue={initialData?.language || ""}
            placeholder="e.g. en"
          />
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <Button type="submit" disabled={isLoading} className="px-8">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export const NotificationsForm = ({ initialData }: { initialData?: any }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      productionReminders: formData.get("productionReminders") === "on",
      aiGenerationAlerts: formData.get("aiGenerationAlerts") === "on",
      weeklyProgressReport: formData.get("weeklyProgressReport") === "on",
    };

    try {
      const result = await saveNotificationSettingsAction(data);
      if (result.success) {
        toast({
          title: "Success",
          description: "Notification settings saved successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label className="text-base">Production Reminders</Label>
          <p className="text-sm text-muted-foreground">
            Get notified about upcoming recording dates and deadlines.
          </p>
        </div>
        <Switch
          name="productionReminders"
          defaultChecked={initialData?.productionReminders !== false}
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label className="text-base">AI Generation Alerts</Label>
          <p className="text-sm text-muted-foreground">
            Receive a summary when your AI has new video ideas for you.
          </p>
        </div>
        <Switch
          name="aiGenerationAlerts"
          defaultChecked={initialData?.aiGenerationAlerts !== false}
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label className="text-base">Weekly Progress Report</Label>
          <p className="text-sm text-muted-foreground">
            A summary of your publishing performance and growth.
          </p>
        </div>
        <Switch
          name="weeklyProgressReport"
          defaultChecked={initialData?.weeklyProgressReport === true}
        />
      </div>

      <div className="mt-8 flex justify-end">
        <Button type="submit" disabled={isLoading} className="px-8">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export const AdvancedForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you absolutely sure? This action cannot be undone and will delete all of your data, ideas, templates, series, and settings.",
      )
    )
      return;

    setIsLoading(true);
    try {
      const result = await deleteAccountAction();
      if (result.success) {
        toast({
          title: "Success",
          description: "Account deleted successfully.",
        });
        await signOut();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete account",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">Delete Account</p>
          <p className="text-sm text-muted-foreground">
            Permanently remove all your ideas, pipeline projects, and series
            data.
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? "Deleting..." : "Delete Account"}
        </Button>
      </div>
    </div>
  );
};
