"use client";

import { useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/stores/formStore";

export default function LoginPage() {
  const {
    loginEmail,
    loginPassword,
    loginError,
    loginLoading,
    setLoginEmail,
    setLoginPassword,
    setLoginError,
    setLoginLoading,
    resetLoginForm,
  } = useFormStore();

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    resetLoginForm();
  }, [resetLoginForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        setLoginError(error.message);
      } else {
        router.push("/overview");
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("ログインに失敗しました。もう一度お試しください。");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-8">
      <div className="flex flex-col gap-8 text-left max-w-md w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded">
                {loginError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-foreground/80 text-sm">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="
                  px-4 py-3 rounded border border-foreground/20
                  bg-background text-foreground
                  focus:border-foreground/40 focus:outline-none
                  transition-colors duration-300
                  placeholder:text-foreground/40
                "
                placeholder="your@email.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-foreground/80 text-sm">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="
                  px-4 py-3 rounded border border-foreground/20
                  bg-background text-foreground
                  focus:border-foreground/40 focus:outline-none
                  transition-colors duration-300
                  placeholder:text-foreground/40
                "
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="
              bg-foreground/70 text-background px-4 py-2 rounded text-center w-fit
              shadow-md shadow-foreground/20 hover:shadow-foreground/40
              hover:bg-foreground hover:text-background/70
              active:shadow-foreground/40
              active:bg-foreground active:text-background/70
              transition-colors duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {loginLoading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <div className="flex flex-col gap-4 text-center">
          <div className="flex flex-col gap-2">
            <p className="text-foreground/60 text-sm">
              まだアカウントをお持ちでない方は
            </p>
            <Link
              href="/signup"
              className="
                text-foreground/80 hover:text-foreground
                underline underline-offset-4
                transition-colors duration-300
              "
            >
              新規登録
            </Link>
          </div>

          <Link
            href="/"
            className="
              text-foreground/60 hover:text-foreground/80
              text-sm underline underline-offset-4
              transition-colors duration-300
            "
          >
            トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
