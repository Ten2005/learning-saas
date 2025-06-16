"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function Home() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleStart = () => {
    if (isAuthenticated) {
      router.push("/chat");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-8">
      <div className="flex flex-col gap-8 text-left">
        <h1 className="text-2xl font-bold">AI共生時代の新たな学び</h1>
        <div className="flex flex-col gap-4">
          <p className="text-foreground/80">
            学びとは言語空間における揺らぎを具体抽象化を通じて会得する主体的行為
          </p>
          <p className="text-foreground/60">
            そして会話はある種、観測し得ない別の未来をもつ
          </p>
          <p className="text-foreground/40">
            その揺らぎこそが新たな学びの源となる。
          </p>
          <p className="text-foreground/60">
            赴くままに紡いだ対話の足跡は、単一且つ複数の物語として人生に共感する。
          </p>
          <p className="text-foreground/80">
            リベラルに毒されコモディティ化した「教養」を捨て
          </p>
          <p className="text-foreground/60">
            AI共生時代に創造性をもたらす場として
          </p>
          <p className="text-foreground/40">
            出現確率の低い文脈、即ち、本来なし得なかった学びを具現化し最適な学習機会を
          </p>
          <p className="text-foreground font-bold">洗練された学習空間を。</p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleStart}
            className="
              bg-foreground/70 text-background px-4 py-2 rounded text-center w-fit
              shadow-md shadow-foreground/20 hover:shadow-foreground/40
              hover:bg-foreground hover:text-background/70
              active:shadow-foreground/40
              active:bg-foreground active:text-background/70
              transition-colors duration-300
            "
          >
            {isLoading
              ? "読み込み中..."
              : isAuthenticated
                ? "チャットを開始"
                : "ログインして始める"}
          </button>

          {isAuthenticated && (
            <Link
              href="/chat"
              className="
                text-foreground/60 hover:text-foreground/80
                text-sm underline underline-offset-4
                transition-colors duration-300
              "
            >
              チャットページへ
            </Link>
          )}

          {!isAuthenticated && !isLoading && (
            <div className="flex gap-4 text-sm">
              <Link
                href="/login"
                className="
                  text-foreground/60 hover:text-foreground/80
                  underline underline-offset-4
                  transition-colors duration-300
                "
              >
                ログイン
              </Link>
              <Link
                href="/signup"
                className="
                  text-foreground/60 hover:text-foreground/80
                  underline underline-offset-4
                  transition-colors duration-300
                "
              >
                新規登録
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
