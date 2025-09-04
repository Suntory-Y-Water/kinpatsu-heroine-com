# Node.js 20の公式devcontainerイメージをベースに使用
# このイメージには開発に必要な基本的なツールが含まれています
FROM mcr.microsoft.com/devcontainers/javascript-node:20-bookworm

# pnpmとwranglerをグローバルにインストール
RUN npm install -g pnpm wrangler

# 作業ディレクトリを設定 
WORKDIR /workspaces

# 環境変数を設定
ENV PNPM_HOME="/home/node/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

# pnpmの設定 (ホームディレクトリ ~/.pnpm-store は /home/node/.pnpm-store を指す)
RUN pnpm config set store-dir ~/.pnpm-store