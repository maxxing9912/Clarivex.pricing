"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function AuthStatus() {
  const { data: session, status } = useSession();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null; // evita mismatch server/client

  if (status === "loading") return <p>Loading...</p>;

  if (!session) {
    return (
      <button
        onClick={() => signIn("discord")}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Login with Discord
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <img
        src={session.user?.image || ""}
        alt={session.user?.name || "User avatar"}
        className="w-10 h-10 rounded-full"
      />
      <span>{session.user?.name}</span>
      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Logout
      </button>
    </div>
  );
}