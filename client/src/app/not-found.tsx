import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6 select-none">
      <div className="w-full max-w-md text-center space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-bold text-sm tracking-tight border border-border shadow-xs">
          404
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Page Not Found
          </h1>
          <p className="text-xs text-muted-foreground">
            The workspace view or route you requested does not exist or has been moved.
          </p>
        </div>
        <div className="pt-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 stroke-[1.5]" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
