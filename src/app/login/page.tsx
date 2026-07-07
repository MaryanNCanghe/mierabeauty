
// src/app/login/page.tsx
"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

enum MODE {
  LOGIN = "LOGIN",
  REGISTER = "REGISTER",
  RESET_PASSWORD = "RESET_PASSWORD",
}

const LoginPage = () => {
  const router = useRouter();
  const [mode, setMode] = useState(MODE.LOGIN);
  const [username, setUsername] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // limpa mensagens ao trocar modo
    setError("");
    setMessage("");
    setPassword("");
    setConfirmPassword("");
  }, [mode]);

  const formTitle =
    mode === MODE.LOGIN
      ? "Log in"
      : mode === MODE.REGISTER
      ? "Register"
      : "Reset Your Password";

  const buttonTitle =
    mode === MODE.LOGIN
      ? "Login"
      : mode === MODE.REGISTER
      ? "Register"
      : "Send Reset Email";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === MODE.LOGIN) {
        if (!email || !password) throw new Error("Preencha e-mail e password.");
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh(); // garante atualização do SSR
      } else if (mode === MODE.REGISTER) {
        if (!email || !password) throw new Error("Preencha e-mail e password.");
        if (password !== confirmPassword) throw new Error("As passwords não coincidem.");
        const { error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: { data: { username } }, // user_metadata
        });
        if (error) throw error;
        setMessage("Registo efetuado. Verifique o seu e-mail para confirmar.");
      } else {
        if (!email) throw new Error("Indique o seu e-mail.");
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password", // rota dedicada
        });
        if (error) throw error;
        setMessage("E-mail de reset enviado. Verifique a sua caixa de correio.");
      }
    } catch (err: any) {
      setError(err?.message ?? "Algo correu mal!");
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled =
    isLoading ||
    (mode === MODE.LOGIN && (!email || !password)) ||
    (mode === MODE.REGISTER && (!email || !password || !confirmPassword));

  return (
  <>
  <div className="min-h-[calc(110vh-80px)] flex">
    {/* LEFT: Image */}
    <div className="hidden md:block md:w-1/2 relative">
      <img
        src="https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg"
        alt="Fashion"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>

    {/* RIGHT: Form */}
    <div className="w-full md:w-1/2 flex items-center justify-center px-4 md:px-8 lg:px-16">
      <form
        className="w-full max-w-md flex flex-col gap-8"
        onSubmit={handleSubmit}
        noValidate
      >
        <h1 className="z-title-md font-semibold">{formTitle}</h1>

        {mode === MODE.REGISTER && (
          <div className="flex flex-col gap-2 z-label">
            <label className="text-sm text-gray-700">Username</label>
            <input
              type="text"
              placeholder="Maria"
              className="ring-2 ring-gray-300 rounded-md p-4"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        )}

        <div className="flex flex-col gap-2 z-label">
          <label className="text-sm text-gray-700">E-mail</label>
          <input
            type="email"
            placeholder="maria@gmail.com"
            className="ring-2 ring-gray-300 rounded-md p-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {(mode === MODE.LOGIN || mode === MODE.REGISTER) && (
          <>
            <div className="flex flex-col gap-2 z-label">
              <label className="text-sm text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="ring-2 ring-gray-300 rounded-md p-4"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {mode === MODE.REGISTER && (
              <div className="flex flex-col gap-2 z-label">
                <label className="text-sm text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Repeat your password"
                  className="ring-2 ring-gray-300 rounded-md p-4"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </>
        )}

        {mode === MODE.LOGIN && (
          <div
            className="z-label-1 underline cursor-pointer"
            onClick={() => setMode(MODE.RESET_PASSWORD)}
          >
            Forgot Password?
          </div>
        )}

        <button
          type="submit"
          className="z-label-1 z-btn--primary  p-3 rounded-md disabled:bg-grey-200"
          disabled={isSubmitDisabled}
        >
          {isLoading ? "Loading..." : buttonTitle}
        </button>

        {!!error && <div className="text-red-600">{error}</div>}

        {mode === MODE.LOGIN && (
          <div
            className="z-label-1 underline cursor-pointer"
            onClick={() => setMode(MODE.REGISTER)}
          >
            {"Don't"} have an account?
          </div>
        )}

        {mode === MODE.REGISTER && (
          <div
            className="text-sm underline cursor-pointer"
            onClick={() => setMode(MODE.LOGIN)}
          >
            Have an account?
          </div>
        )}

        {mode === MODE.RESET_PASSWORD && (
          <div
            className="text-sm underline cursor-pointer"
            onClick={() => setMode(MODE.LOGIN)}
          >
            Go back to Login
          </div>
        )}

      </form>
    </div>
  </div>

  {/* Registration success overlay */}
  {mode === MODE.REGISTER && !!message && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white px-10 py-12 max-w-sm w-full mx-4 flex flex-col items-center gap-6 text-center shadow-xl">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <circle cx="20" cy="20" r="19" stroke="var(--m-gold)" strokeWidth="1.5" />
          <path d="M12 20.5l6 6 10-12" stroke="var(--m-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2 className="font-display text-2xl tracking-wide text-[var(--m-black)]">You&apos;re registered!</h2>
        <p className="text-sm text-[var(--m-muted)] font-light leading-relaxed">{message}</p>
        <button
          type="button"
          onClick={() => { setMessage(""); setMode(MODE.LOGIN); }}
          className="mt-2 w-full py-3 m-btn bg-[var(--m-black)] text-white hover:bg-[var(--m-gold)] transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  )}

  {/* Reset password email sent overlay */}
  {mode === MODE.RESET_PASSWORD && !!message && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white px-10 py-12 max-w-sm w-full mx-4 flex flex-col items-center gap-6 text-center shadow-xl">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <circle cx="20" cy="20" r="19" stroke="var(--m-gold)" strokeWidth="1.5" />
          <path d="M10 20h20M24 14l6 6-6 6" stroke="var(--m-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2 className="font-display text-2xl tracking-wide text-[var(--m-black)]">Email sent!</h2>
        <p className="text-sm text-[var(--m-muted)] font-light leading-relaxed">
          Check your inbox and follow the link to reset your password.
        </p>
        <button
          type="button"
          onClick={() => { setMessage(""); setMode(MODE.LOGIN); }}
          className="mt-2 w-full py-3 m-btn bg-[var(--m-black)] text-white hover:bg-[var(--m-gold)] transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  )}
  </>
);

};

export default LoginPage;
