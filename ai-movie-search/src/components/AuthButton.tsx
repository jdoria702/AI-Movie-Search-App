// src/components/AuthButton.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <button
        onClick={() => signIn("google")}
        className="border rounded px-3 py-2"
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <span>{session.user?.email}</span>

      <button
        onClick={() => signOut()}
        className="border rounded px-3 py-2"
      >
        Logout
      </button>
    </div>
  );
}
