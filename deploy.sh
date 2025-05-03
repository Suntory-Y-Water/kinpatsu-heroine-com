#!/bin/bash

# エラー時にスクリプトを終了
set -e

# カラー出力の定義
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m' # No Color

# ログ出力関数
function logInfo() {
    echo -e "${GREEN}[Info]${NC} $1"
}

function logWarn() {
    echo -e "${YELLOW}[Warning]${NC} $1"
}

function logError() {
    echo -e "${RED}[Error]${NC} $1"
}

# .dev.varsファイルの存在確認
if [ ! -f .dev.vars ]; then
    logWarn ".dev.varsファイルが見つかりません。デフォルト設定を使用します。"
fi

# 現在の環境を確認
logInfo "現在の環境を確認中..."
if ! wrangler whoami >/dev/null 2>&1; then
    logError "Wranglerの認証に失敗しました。'wrangler login'を実行してください"
    exit 1
fi

# wranglerユーザー情報を表示
wrangler whoami

# ビルド実行
logInfo "アプリケーションをビルド中..."
if ! pnpm run build; then
    logError "ビルドに失敗しました"
    exit 1
fi

# デプロイ実行
logInfo "Cloudflare Workersにデプロイ中..."
if wrangler deploy; then
    logInfo "デプロイが正常に完了しました！"
else
    logError "デプロイに失敗しました"
    exit 1
fi