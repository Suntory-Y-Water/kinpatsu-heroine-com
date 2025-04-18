FROM node:20.18.0-slim

# 必要なパッケージをインストール
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

# 作業ディレクトリの設定
WORKDIR /workspace

# デフォルトのシェルをbashに設定
SHELL ["/bin/bash", "-c"]

# Wranglerを使用するためのCloudflareの構成ディレクトリを作成
RUN mkdir -p /root/.wrangler