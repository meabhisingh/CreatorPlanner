import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PromoVideoPlayer } from "@/components/ui/hero-video";
import { getPublicUrl } from "@/constants/bucket";
import { Calendar, Lightbulb, Sparkles, TrendingUp, Video } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative py-24">
      {/* background glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(82,82,224,0.25),transparent_60%)]" />

      <div className="mx-auto max-w-6xl px-6 text-center">
        {/* badge */}
        <Badge className="mb-6 bg-primary/10 text-primary border-none px-4 py-1 text-sm">
          <Sparkles className="mr-2 h-3 w-3" />
          Built for Modern Creators
        </Badge>

        {/* headline */}
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
          Turn Your{" "}
          <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Content Ideas
          </span>{" "}
          Into Published Videos
        </h1>

        {/* subtext */}
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage ideas, track video production, and schedule uploads — all in
          one powerful creator dashboard.
        </p>

        {/* CTA */}
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/console">Start Creating</Link>
          </Button>

          <Button size="lg" variant="outline" asChild>
            <Link href="#demo">Watch Demo</Link>
          </Button>
        </div>

        {/* feature highlights */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-secondary/20 p-5 backdrop-blur">
            <Lightbulb className="h-6 w-6 text-amber-400" />
            <p className="text-sm font-medium">Capture Ideas</p>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-secondary/20 p-5">
            <Video className="h-6 w-6 text-primary" />
            <p className="text-sm font-medium">Track Production</p>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-secondary/20 p-5">
            <Calendar className="h-6 w-6 text-emerald-400" />
            <p className="text-sm font-medium">Schedule Uploads</p>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-secondary/20 p-5">
            <TrendingUp className="h-6 w-6 text-purple-400" />
            <p className="text-sm font-medium">Grow Faster</p>
          </div>
        </div>

        {/* dashboard preview */}
        <div className="mt-20 relative">
          <div
            className="rounded-2xl border border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl p-6 "
            id="demo"
          >
            <PromoVideoPlayer src={getPublicUrl("assets/promo.mp4")} />
          </div>

          {/* glow */}
          <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-r from-primary/40 to-purple-400/40 blur-2xl opacity-40" />
        </div>
      </div>
    </section>
  );
}
