// src/components/AuthButton.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  if (!session) {
    return <button onClick={() => signIn("google")}>Sign in</button>;
  }

  return (
    <button onClick={() => signOut()}>
      Sign out {session.user?.email}
    </button>
  );
}
