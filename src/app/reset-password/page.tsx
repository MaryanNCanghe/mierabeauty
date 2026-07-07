
// src/app/reset-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const { data: sub } = supabaseClient.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
        setMessage("Token validado. Defina a nova password.");
      }
    });
    return () => sub.subscription?.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setMessage("");

    if (!password || password !== confirm) {
      setError("As passwords devem coincidir.");
      return;
    }
    const { error } = await supabaseClient.auth.updateUser({ password });
    if (error) return setError(error.message);

    setMessage("Password atualizada com sucesso.");
    setTimeout(() => router.replace("/login"), 1200);
  }

  if (!ready) return (
    <div className="max-w-md mx-auto mt-12 text-sm text-gray-600">
      Validating link… if nothing happens, the link may have expired.{" "}
      <a href="/login" className="underline text-[var(--m-gold)]">Request a new one</a>
    </div>
  );

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-xl font-semibold mb-4">Definir nova password</h1>
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <input
          type="password"
          placeholder="Nova password"
          className="ring-2 ring-gray-300 rounded-md p-4"
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirmar password"
          className="ring-2 ring-gray-300 rounded-md p-4"
          value={confirm} onChange={(e) => setConfirm(e.target.value)}
        />
        <button className="bg-lama text-white p-2 rounded-md">Guardar</button>
        {!!error && <div className="text-red-600">{error}</div>}
        {!!message && <div className="text-green-600">{message}</div>}
      </form>
    </div>
  );
}
