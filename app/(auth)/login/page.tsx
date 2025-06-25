"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/stores/formStore";
import ButtonLink from "@/app/components/common/ButtonLink";
import LabelInput from "@/app/components/common/LabelInput";
import Button from "@/app/components/common/Button";

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
      }
      router.push("/overview");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("ログインに失敗しました。もう一度お試しください。");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-8">
      <div className="flex flex-col gap-8 text-left max-w-md w-full">
        <h1 className="text-2xl font-bold text-center">ログイン</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded">
                {loginError}
              </div>
            )}

            <LabelInput
              label="メールアドレス"
              id="email"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
            <LabelInput
              label="パスワード"
              id="password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            <Button onClick={handleSubmit} variant="primary">
              {loginLoading ? "ログイン中..." : "ログイン"}
            </Button>
          </div>
        </form>

        <div className="flex flex-col gap-4 text-center">
          <div className="flex flex-col gap-2">
            <p className="text-foreground/60 text-sm">
              まだアカウントをお持ちでない方は
            </p>
            <ButtonLink href="/signup" variant="outline">
              新規登録
            </ButtonLink>
          </div>

          <ButtonLink href="/" variant="outlineSecondary">
            トップページに戻る
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
