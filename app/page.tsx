"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import ButtonLink from "./components/common/ButtonLink";

export default function Home() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

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
          {isAuthenticated && (
            <ButtonLink
              href={isAuthenticated ? "/chat" : "/login"}
              variant="primary"
            >
              チャットを開始
            </ButtonLink>
          )}

          {!isAuthenticated && !isLoading && (
            <div className="flex gap-4 text-sm">
              <ButtonLink href="/login" variant="primary">
                ログイン
              </ButtonLink>
              <ButtonLink href="/signup" variant="primary">
                新規登録
              </ButtonLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
