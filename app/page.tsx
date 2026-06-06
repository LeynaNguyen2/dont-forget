import ErrorBoundary from "@/components/ErrorBoundary";
import HomePage from "@/components/HomePage";

export default function Home() {
  return (
    <ErrorBoundary>
      <HomePage />
    </ErrorBoundary>
  );
}
