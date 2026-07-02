<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cortex.hydroroll.team/api/og?index=50&tier=moderateDecline&correct=%3F">
    <img src="https://cortex.hydroroll.team/api/og?index=50&tier=moderateDecline&correct=%3F" alt="Cognitive Rustproof" width="600">
  </picture>
</p>

<h1 align="center">Cognitive Rustproof</h1>

<p align="center">
  <em>How is your cognitive state? An open-source IRT-based test that measures AI's impact on your thinking abilities.</em>
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
  <b>English</b> · <a href="README.zh.md">中文</a> · <a href="README.ja.md">日本語</a>
</p>

---

## What Is This

Cognitive Rustproof is an open-source cognitive baseline test that helps you regularly measure your core mental abilities — logic reasoning, mental math, and vocabulary.

It uses **Item Response Theory (IRT)**, the same framework behind the SAT and GRE, to adapt question difficulty to your ability level in real time. Each test takes about 15 minutes. Results give you a **degradation index** (0–100, lower is better).

The real value comes from **retesting**: take a test every 7+ days and connect the dots. Trends matter more than any single score.

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to preview.

---

## AI Question Generation

The test includes AI-generated questions with adaptive difficulty. Configure your LLM API:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API key (any OpenAI-compatible provider — DeepSeek recommended):

| Variable                  | Description                                |
| ------------------------- | ------------------------------------------ |
| `OPENAI_BASE_URL`         | API endpoint (default: DeepSeek)           |
| `OPENAI_API_KEY`          | Your API key                               |
| `OPENAI_MODEL`            | Model name (default: `deepseek-v4-flash`)  |
| `NEXT_PUBLIC_ADAPTIVE_MODE` | Set `true` to enable AI questions        |

---

## Tech Stack

| Layer     | Choice                                    |
| --------- | ----------------------------------------- |
| Framework | Next.js 16 (App Router)                   |
| UI        | React 19 + Tailwind CSS v4 + shadcn/ui    |
| Package   | pnpm                                      |
| Language  | TypeScript                                |

---

## Links

- **Official site**: [cortex.hydroroll.team](https://cortex.hydroroll.team)
- **GitHub**: [github.com/HsiangNianian/cortex](https://github.com/HsiangNianian/cortex)

---

## License

[![MIT](https://img.shields.io/badge/license-MIT-65a30d)](LICENSE)

MIT © Hsiang Nianian
