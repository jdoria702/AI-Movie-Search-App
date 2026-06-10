// src/app/providers.tsx
// layout.tsx is a server component
// SessionProvider is a client component

"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}