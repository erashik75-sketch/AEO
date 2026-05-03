import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card>
        <p className="text-zinc-700">
          Configure Google OAuth, email (magic link),{" "}
          <code className="rounded bg-zinc-100 px-1">AUTH_SECRET</code>, and AI keys in
          your environment. Dev mode supports email-based Credentials sign-in.
        </p>
      </Card>
    </div>
  );
}
