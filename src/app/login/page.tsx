"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AuthScreen } from "@/components/AuthScreen";

function Spinner() {
  return (
    <div className="flex h-full items-center justify-center">
      <span className="flex gap-[5px] items-center">
        <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "120ms" }} />
        <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "240ms" }} />
      </span>
    </div>
  );
}

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/chat");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <main className="flex flex-col h-full">
        <div className="flex-1 overflow-hidden">
          <Spinner />
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <AuthScreen callbackUrl="/chat" />
      </div>
    </main>
  );
}
