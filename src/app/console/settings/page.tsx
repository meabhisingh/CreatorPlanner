import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Code2, Shield, User, Youtube } from "lucide-react";
import {
  AdvancedForm,
  APIForm,
  ChannelForm,
  NotificationsForm,
  ProfileForm,
} from "./component";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-secondary/30 p-1 h-auto">
          <TabsTrigger
            value="profile"
            className="px-6 py-2.5 flex items-center gap-2"
          >
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>

          <TabsTrigger
            value="api"
            className="px-6 py-2.5 flex items-center gap-2"
          >
            <Code2 className="h-4 w-4" /> API
          </TabsTrigger>

          <TabsTrigger
            value="channel"
            className="px-6 py-2.5 flex items-center gap-2"
          >
            <Youtube className="h-4 w-4" /> Channel
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="px-6 py-2.5 flex items-center gap-2"
          >
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger
            value="advanced"
            className="px-6 py-2.5 flex items-center gap-2"
          >
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-6">
          <Profile />
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <API />
        </TabsContent>

        <TabsContent value="channel" className="space-y-6">
          <Channel />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Notifications />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Advanced />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const Profile = () => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Public Profile</CardTitle>
        <CardDescription>
          How other creators see you on the platform.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <ProfileForm />
      </CardContent>
    </Card>
  );
};

const API = async () => {
  const session = await getServerSession();

  if (!session?.user) return redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: { openaiApiKey: true },
  });

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>API Config</CardTitle>
        <CardDescription>Bring you own AI to use AI features.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <APIForm savedKey={user?.openaiApiKey} />
      </CardContent>
    </Card>
  );
};

const Channel = async () => {
  const session = await getServerSession();

  if (!session?.user) return redirect("/sign-in");

  const channel = await prisma.channel.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>YouTube Channel Info</CardTitle>
        <CardDescription>
          Primary data for your AI Content Strategist.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ChannelForm initialData={channel} />
      </CardContent>
    </Card>
  );
};

const Notifications = async () => {
  const session = await getServerSession();

  if (!session?.user) return redirect("/sign-in");

  const prefs = await prisma.notificationPreference.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Email Notifications</CardTitle>
        <CardDescription>
          Choose what updates you want to receive.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <NotificationsForm initialData={prefs} />
      </CardContent>
    </Card>
  );
};

const Advanced = () => {
  return (
    <Card className="glass-card border-destructive/20">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Irreversible actions for your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AdvancedForm />
      </CardContent>
    </Card>
  );
};
