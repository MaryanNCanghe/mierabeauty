
"use client";

import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      console.error("Sign out error:", error.message);
    }
    router.push("/");
    router.refresh(); // cookies/SSR
  }
  return (
    <button onClick={logout} className="text-sm text-gray-600">
      Logout
    </button>
  );
}
