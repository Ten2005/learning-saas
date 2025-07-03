"use client";

import React, { Component, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">エラーが発生しました</h2>
          <p className="text-gray-600 text-center max-w-md mb-6">
            申し訳ございません。予期しないエラーが発生しました。
            ページを再読み込みしてもう一度お試しください。
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ページを再読み込み
          </button>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-8 w-full max-w-2xl">
              <summary className="cursor-pointer text-sm text-gray-500">
                エラー詳細（開発環境のみ）
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}