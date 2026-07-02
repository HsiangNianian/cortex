<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cortex.hydroroll.team/api/og?index=50&tier=moderateDecline&correct=%3F">
    <img src="https://cortex.hydroroll.team/api/og?index=50&tier=moderateDecline&correct=%3F" alt="认知防锈" width="600">
  </picture>
</p>

<h1 align="center">认知防锈 · Cognitive Rustproof</h1>

<p align="center">
  <em>你的认知状态还好吗？一个开源的自适应 IRT 认知基线测试，测量 AI 对你思考能力的影响。</em>
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
  <a href="README.md">English</a> · <b>中文</b> · <a href="README.ja.md">日本語</a>
</p>

---

## 这是什么

认知防锈是一个开源认知基线测试工具，帮助你定期测量核心心智能力——逻辑推理、速算、词汇语义。

使用 **项目反应理论 (IRT)**——与 SAT、GRE 相同的考试框架——实时调整题目难度以适应你的能力水平。每次测试约 15 分钟，完成后得到一个**退化指数**（0–100，越低越好）。

真正的价值在于**复测**：每隔 7 天以上测一次，把分数连起来看趋势。趋势比单次分数更有意义。

---

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

打开 `http://localhost:3000` 预览。

---

## AI 出题

测试包含 AI 实时生成的题目。要启用此功能，配置你的 LLM API：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 API 密钥（支持任何 OpenAI 兼容的 API 提供商——推荐 DeepSeek）：

| 变量                      | 说明                                       |
| ------------------------- | ------------------------------------------ |
| `OPENAI_BASE_URL`         | API 端点（默认：DeepSeek）                 |
| `OPENAI_API_KEY`          | 你的 API 密钥                              |
| `OPENAI_MODEL`            | 模型名称（默认：`deepseek-v4-flash`）      |
| `NEXT_PUBLIC_ADAPTIVE_MODE` | 设为 `true` 启用 AI 出题                |

---

## 技术栈

| 层       | 选型                                       |
| -------- | ------------------------------------------ |
| 框架     | Next.js 16 (App Router)                    |
| UI       | React 19 + Tailwind CSS v4 + shadcn/ui      |
| 包管理   | pnpm                                       |
| 语言     | TypeScript                                 |

---

## 链接

- **官方站点**：[cortex.hydroroll.team](https://cortex.hydroroll.team)
- **GitHub**：[github.com/HsiangNianian/cortex](https://github.com/HsiangNianian/cortex)

---

## 许可证

[![MIT](https://img.shields.io/badge/license-MIT-65a30d)](LICENSE)

MIT © 简律纯
