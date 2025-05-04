#!/bin/bash

# エラー時にスクリプトを終了
set -e

# カラー出力の定義
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m' # No Color
readonly SECRETS_FILE=".dev.vars"

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

# セキュアに環境変数を設定する関数
function setSecret() {
    local key=$1
    local value=$2
    
    if [ -z "$value" ]; then
        logWarn "$key の値が空です。スキップします。"
        return 0
    fi
    
    logInfo "$key を設定中..."
    if echo "$value" | wrangler secret put "$key"; then
        logInfo "$key の設定に成功しました"
    else
        logError "$key の設定に失敗しました"
        exit 1
    fi
}

# .dev.varsファイルの存在確認
if [ ! -f "$SECRETS_FILE" ]; then
    logError "$SECRETS_FILE ファイルが見つかりません"
    exit 1
fi

# Wrangler認証確認
logInfo "Wrangler認証を確認中..."
if ! wrangler whoami >/dev/null 2>&1; then
    logError "Wranglerの認証に失敗しました。'wrangler login'を実行してください"
    exit 1
fi

# 現在の環境変数リストを表示
logInfo "現在の環境変数リスト:"
wrangler secret list

# 環境変数を読み込み
declare -A ENV_VARS
while IFS='=' read -r key value; do
    # コメント行や空行をスキップ
    [[ $key =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue
    # 先頭と末尾の空白を削除
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    ENV_VARS["$key"]="$value"
done < "$SECRETS_FILE"

# 環境変数設定の確認
echo -e "\n${YELLOW}=== 環境変数設定の確認 ===${NC}"
for key in "${!ENV_VARS[@]}"; do
    if [[ $key == *"PASSWORD"* ]] || [[ $key == *"SECRET"* ]] || [[ $key == *"TOKEN"* ]]; then
        echo "$key: [MASKED]"
    else
        echo "$key: ${ENV_VARS[$key]}"
    fi
done

# ユーザー操作は一旦コメントアウト
# ユーザー確認
echo -e "\n${YELLOW}これらの環境変数を設定してよろしいですか？(y/n)${NC}"
read -r confirmation

if [[ $confirmation != "y" && $confirmation != "Y" ]]; then
    logInfo "操作がキャンセルされました"
    exit 0
fi

# ---------------------
# シークレットを個別に設定
# ---------------------
echo -e "\n${GREEN}=== 環境変数を設定中 ===${NC}"

setSecret "CLOUDFLARE_ACCOUNT_ID" "${ENV_VARS[CLOUDFLARE_ACCOUNT_ID]}"
setSecret "CLOUDFLARE_DATABASE_ID" "${ENV_VARS[CLOUDFLARE_DATABASE_ID]}"
setSecret "CLOUDFLARE_D1_TOKEN" "${ENV_VARS[CLOUDFLARE_D1_TOKEN]}"
setSecret "R2_ENDPOINT" "${ENV_VARS[R2_ENDPOINT]}"
setSecret "ANNICT_CLIENT_ID" "${ENV_VARS[ANNICT_CLIENT_ID]}"
setSecret "JWT_SECRET" "${ENV_VARS[JWT_SECRET]}"
setSecret "ADMIN_USERNAME" "${ENV_VARS[ADMIN_USERNAME]}"
setSecret "ADMIN_PASSWORD_HASH" "${ENV_VARS[ADMIN_PASSWORD_HASH]}"
setSecret "PUBLIC_APP_URL" "${ENV_VARS[PUBLIC_APP_URL]}"

# ビルド実行
logInfo "アプリケーションをビルド中..."
if ! pnpm run build; then
    logError "ビルドに失敗しました"
    exit 1
fi

# デプロイ実行
logInfo "Cloudflare Workersにデプロイ中..."
if wrangler deploy; then
    logInfo "環境変数設定とデプロイが正常に完了しました！"
else
    logError "デプロイに失敗しました"
    exit 1
fi