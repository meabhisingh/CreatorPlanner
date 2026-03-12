import { Suspense } from "react";
import AIGeneratorComponent from "./component";
import { Loader2 } from "lucide-react";

export default function AIGeneratorPage() {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <AIGeneratorComponent />
      </Suspense>
    </div>
  );
}