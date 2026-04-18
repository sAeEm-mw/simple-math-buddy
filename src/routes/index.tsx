import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "@/components/Calculator";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Calculator" },
      { name: "description", content: "A simple, elegant calculator app." },
    ],
  }),
});

function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-xs">
        <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight text-foreground">
          Calculator
        </h1>
        <Calculator />
      </div>
    </main>
  );
}
