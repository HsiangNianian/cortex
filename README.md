# 认知防锈 · Cognitive Anti-Rust

一个认知健康追踪工具，帮助用户感知、测量、延缓因过度依赖 AI 而导致的核心心智能力退化。

## Phase 0 — 静态验证器

当前阶段目标：验证"退化感知"的情绪价值。

- 5 道混合题型（逻辑/速算/词汇）
- 前端计时（40s/题）+ 自我声明（承诺不使用 AI）
- 退化指数算法（0-100）
- 结果分级（5 档）
- 可分享的结果卡
- 本地持久化（浏览器 localStorage）

## 技术栈

| 层     | 选型                             |
| ------ | -------------------------------- |
| 框架   | Next.js 16 (App Router)          |
| UI     | React 19 + Tailwind CSS v4 + shadcn/ui |
| 平台   | Vercel                           |
| 包管理 | pnpm                             |
| 语言   | TypeScript                       |

## 启动

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 构建

```bash
pnpm build
pnpm start
```
