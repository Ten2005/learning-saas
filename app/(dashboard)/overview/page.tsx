export default function Overview() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">概要</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-card rounded-lg border border-foreground/10 p-6">
            <h2 className="text-xl font-semibold mb-3">学習進捗</h2>
            <p className="text-foreground/70">
              あなたの学習の進捗状況を確認できます。
            </p>
          </div>
          
          <div className="bg-card rounded-lg border border-foreground/10 p-6">
            <h2 className="text-xl font-semibold mb-3">AIチャット</h2>
            <p className="text-foreground/70">
              AIアシスタントと会話して学習をサポートしてもらいましょう。
            </p>
          </div>
          
          <div className="bg-card rounded-lg border border-foreground/10 p-6">
            <h2 className="text-xl font-semibold mb-3">レッスン</h2>
            <p className="text-foreground/70">
              構造化されたレッスンで効率的に学習を進められます。
            </p>
          </div>
        </div>
        
        <div className="mt-8 bg-card rounded-lg border border-foreground/10 p-6">
          <h2 className="text-xl font-semibold mb-3">最近の活動</h2>
          <p className="text-foreground/70">
            まだ活動がありません。チャットを開始して学習を始めましょう！
          </p>
        </div>
      </div>
    </div>
  );
}