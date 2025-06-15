#!/bin/bash

# Reusable Workflowsのコミットハッシュを自動更新するスクリプト

set -euo pipefail

# 設定
REPO_OWNER="Suntory-Y-Water"
REPO_NAME="my-github-actions-ci"
WORKFLOW_FILE=".github/workflows/ci.yml"

# 最新のコミットハッシュを取得
echo "📡 最新のコミットハッシュを取得中..."
LATEST_HASH=$(curl -s "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits/main" | jq -r '.sha')

if [[ -z "$LATEST_HASH" || "$LATEST_HASH" == "null" ]]; then
    echo "❌ コミットハッシュの取得に失敗しました"
    exit 1
fi

echo "✅ 最新ハッシュ: $LATEST_HASH"

# 全ての reusable workflow 参照を最新ハッシュに置換
# パターン: Suntory-Y-Water/my-github-actions-ci/.github/workflows/任意のファイル名.yml@任意の参照
sed -i.tmp "s|${REPO_OWNER}/${REPO_NAME}/\.github/workflows/[^@]*\.yml@[^[:space:]]*|&|g; s|@[^[:space:]]*|@${LATEST_HASH}|g" "$WORKFLOW_FILE"

# 一時ファイルを削除
rm -f "${WORKFLOW_FILE}.tmp"

echo "✅ ワークフローファイルを更新しました"

echo ""
echo "🎉 完了！以下のコマンドでコミット・プッシュできます:"
echo "git add $WORKFLOW_FILE"
echo "git commit -m 'ci: update reusable workflow hash to $LATEST_HASH'"
echo "git push"