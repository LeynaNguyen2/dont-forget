import ErrorBoundary from "@/components/ErrorBoundary";
import SettingsPage from "@/components/SettingsPage";

export default function Settings() {
  return (
    <ErrorBoundary>
      <SettingsPage />
    </ErrorBoundary>
  );
}
