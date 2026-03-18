import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
          <FileQuestion className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Page Not Found</h1>
        <p className="text-lg text-muted-foreground max-w-md mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all"
        >
          Return Home
        </Link>
      </div>
    </AppLayout>
  );
}
