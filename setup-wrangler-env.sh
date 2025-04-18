#!/bin/bash

# Wrangler環境変数セットアップスクリプト
# Dockerコンテナ内で実行することを想定しています

# .dev.varsファイルが存在するか確認
if [ -f ".dev.vars" ]; then
  echo "Copying .dev.vars for Wrangler..."
  mkdir -p .wrangler
  cp .dev.vars .wrangler/dev.vars
  echo "Wrangler環境変数が設定されました"
else
  echo ".dev.varsファイルが見つかりません。環境変数を手動で設定してください。"
  exit 1
fi

# Wrangler設定ファイルのパーミッション設定
if [ -d ".wrangler" ]; then
  chmod -R 700 .wrangler
  echo "Wranglerディレクトリのパーミッションを設定しました"
fi

echo "環境のセットアップが完了しました"