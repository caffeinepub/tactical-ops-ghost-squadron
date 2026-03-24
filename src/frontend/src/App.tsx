import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2, Skull } from "lucide-react";
import { useProfile } from "./hooks/useQueries";
import GamePage from "./pages/GamePage";
import RegistrationPage from "./pages/RegistrationPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-primary/20 border-2 border-primary flex items-center justify-center">
          <Skull className="w-8 h-8 text-primary" />
        </div>
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <span className="font-condensed text-xs text-muted-foreground tracking-widest">
          LOADING TACTICAL DATA...
        </span>
      </div>
    );
  }

  if (!profile) {
    return <RegistrationPage />;
  }

  return <GamePage />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}
