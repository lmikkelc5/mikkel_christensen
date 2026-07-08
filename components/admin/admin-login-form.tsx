"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const next = searchParams.get("next") || "/admin";

  return (
    <form
      className="surface mx-auto max-w-md space-y-5 p-8"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");

        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });

        setSaving(false);

        if (!response.ok) {
          setError("Invalid username or password.");
          return;
        }

        router.push(next);
        router.refresh();
      }}
    >
      <div>
        <h1 className="text-3xl font-semibold">Admin login</h1>
        <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
          Sign in to manage articles, recipes, projects, and photography.
        </p>
      </div>

      <Field label="Username" value={username} onChange={setUsername} />
      <Field label="Password" type="password" value={password} onChange={setPassword} />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        className="w-full rounded-2xl border bg-transparent px-4 py-3 outline-none focus:border-[var(--color-accent)]"
      />
    </label>
  );
}
