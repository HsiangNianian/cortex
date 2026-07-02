<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cortex.hydroroll.team/api/og?index=50&tier=moderateDecline&correct=%3F">
    <img src="https://cortex.hydroroll.team/api/og?index=50&tier=moderateDecline&correct=%3F" alt="認知力テスト" width="600">
  </picture>
</p>

<h1 align="center">認知力テスト · Cognitive Rustproof</h1>

<p align="center">
  <em>あなたの認知状態は？オープンソースの適応型 IRT 認知ベースラインテスト。AI が思考能力に与えた影響を測定します。</em>
</p>

<p align="center">
  <a href="https://github.com/HsiangNianian/cortex"><img src="https://img.shields.io/github/stars/HsiangNianian/cortex?style=flat&logo=github&color=eed64a" alt="GitHub stars"></a>
  <a href="https://github.com/HsiangNianian/cortex/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-65a30d?style=flat" alt="MIT license"></a>
  <a href="https://cortex.hydroroll.team"><img src="https://img.shields.io/badge/demo-cortex.hydroroll.team-000?style=flat&logo=cloudflare" alt="Demo"></a>
  <br>
  <img src="https://img.shields.io/badge/Next.js_16-000?style=flat&logo=next.js" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React_19-000?style=flat&logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/shadcn/ui-000?style=flat&logo=shadcnui" alt="shadcn/ui">
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-000?style=flat&logo=tailwindcss" alt="Tailwind CSS v4">
  <img src="https://img.shields.io/badge/TypeScript-000?style=flat&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/pnpm-000?style=flat&logo=pnpm" alt="pnpm">
</p>

<p align="center">
  <a href="README.md">English</a> · <a href="README.zh.md">中文</a> · <b>日本語</b>
</p>

---

## これは何？

認知力テストは、論理推論・暗算・語彙意味という中核的な思考能力を定期的に測定するためのオープンソースの認知ベースラインテストです。

**項目反応理論 (IRT)** — SAT や GRE と同じ枠組み — を使用し、問題の難易度をリアルタイムで能力レベルに適応させます。各テストは約 15 分で完了し、**退化指数**（0–100、低いほど良い）が表示されます。

本当の価値は**再テスト**にあります：7 日以上の間隔を空けてテストを受け、スコアを連続してみることで傾向がわかります。

---

## クイックスタート

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

`http://localhost:3000` にアクセス。

---

## AI 問題生成

AI がリアルタイムで問題を生成します。有効にするには LLM API を設定してください：

```bash
cp .env.example .env.local
```

`.env.local` を編集し、API キーを入力（OpenAI 互換の API プロバイダに対応 — DeepSeek 推奨）：

| 変数                      | 説明                                       |
| ------------------------- | ------------------------------------------ |
| `OPENAI_BASE_URL`         | API エンドポイント（デフォルト：DeepSeek） |
| `OPENAI_API_KEY`          | あなたの API キー                          |
| `OPENAI_MODEL`            | モデル名（デフォルト：`deepseek-v4-flash`）|
| `NEXT_PUBLIC_ADAPTIVE_MODE` | `true` に設定すると AI 問題が有効に      |

---

## 技術スタック

| 層               | 選択                                       |
| ---------------- | ------------------------------------------ |
| フレームワーク   | Next.js 16 (App Router)                    |
| UI               | React 19 + Tailwind CSS v4 + shadcn/ui    |
| パッケージ管理   | pnpm                                       |
| 言語             | TypeScript                                 |

---

## リンク

- **公式サイト**：[cortex.hydroroll.team](https://cortex.hydroroll.team)
- **GitHub**：[github.com/HsiangNianian/cortex](https://github.com/HsiangNianian/cortex)

---

## ライセンス

[![MIT](https://img.shields.io/badge/license-MIT-65a30d)](LICENSE)

MIT © 簡律純
