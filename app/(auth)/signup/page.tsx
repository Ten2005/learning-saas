"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/stores/formStore";
import ButtonLink from "@/app/components/common/ButtonLink";
import LabelInput from "@/app/components/common/LabelInput";
import Button from "@/app/components/common/Button";

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

            <LabelInput
              label="メールアドレス"
              id="email"
              type="email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />

            <LabelInput
              label="パスワード"
              id="password"
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            <LabelInput
              label="パスワード（確認）"
              id="confirmPassword"
              type="password"
              value={signupConfirmPassword}
              onChange={(e) => setSignupConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <Button onClick={handleSubmit} variant="primary">
            {signupLoading ? "登録中..." : "登録"}
          </Button>
        </form>

        <div className="flex flex-col gap-4 text-center">
          <div className="flex flex-col gap-2">
            <p className="text-foreground/60 text-sm">
              既にアカウントをお持ちの方は
            </p>
            <ButtonLink href="/login" variant="outline">
              ログイン
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
