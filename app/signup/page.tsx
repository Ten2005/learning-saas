"use client";

import { useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/stores/formStore";

export default function SignupPage() {
  const {
    signupEmail,
    signupPassword,
    signupConfirmPassword,
    signupError,
    signupMessage,
    signupLoading,
    setSignupEmail,
    setSignupPassword,
    setSignupConfirmPassword,
    setSignupError,
    setSignupMessage,
    setSignupLoading,
    resetSignupForm,
  } = useFormStore();

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    resetSignupForm();
  }, [resetSignupForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError("");
    setSignupMessage("");

    if (signupPassword !== signupConfirmPassword) {
      setSignupError("パスワードが一致しません。");
      setSignupLoading(false);
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError("パスワードは6文字以上で入力してください。");
      setSignupLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
      });

      if (error) {
        setSignupError(error.message);
      } else {
        setSignupMessage("確認メールを送信しました。メールをご確認ください。");
        // 登録成功後、少し待ってからログインページにリダイレクト
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setSignupError("登録に失敗しました。もう一度お試しください。");
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-8">
      <div className="flex flex-col gap-8 text-left max-w-md w-full">
        <h1 className="text-2xl font-bold text-center">新規登録</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {signupError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded">
                {signupError}
              </div>
            )}

            {signupMessage && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded">
                {signupMessage}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-foreground/80 text-sm">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
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
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
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

            <div className="flex flex-col gap-2">
              <label
                htmlFor="confirmPassword"
                className="text-foreground/80 text-sm"
              >
                パスワード（確認）
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={signupConfirmPassword}
                onChange={(e) => setSignupConfirmPassword(e.target.value)}
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
            disabled={signupLoading}
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
            {signupLoading ? "登録中..." : "登録"}
          </button>
        </form>

        <div className="flex flex-col gap-4 text-center">
          <div className="flex flex-col gap-2">
            <p className="text-foreground/60 text-sm">
              既にアカウントをお持ちの方は
            </p>
            <Link
              href="/login"
              className="
                text-foreground/80 hover:text-foreground
                underline underline-offset-4
                transition-colors duration-300
              "
            >
              ログイン
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
