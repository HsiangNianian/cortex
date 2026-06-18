---
title: "Cortex Cloudflare 首周运营数据"
topic: technical/data
data_type: metrics/dashboard
complexity: moderate
point_count: 12
source_language: zh
user_language: zh
---

## Main Topic
Cortex 项目在 Cloudflare Workers 上线的首周（2026年6月11日-17日）运营数据总览，展示 Worker 请求量、D1数据库使用情况、性能指标和流量趋势。

## Learning Objectives
After viewing this infographic, the viewer should understand:
1. Cortex 上线首周的整体流量规模、峰值负载和零错误的稳定性
2. 每日请求量趋势（从 12万到 247万的增长曲线）
3. 核心性能指标（CPU时间、Wall时间）和数据库负载特征

## Target Audience
- **Knowledge Level**: General technical audience, project users, project stakeholders
- **Context**: Sharing on QQ空间 — social media platform for project promotion
- **Expectations**: Quick visual understanding of project scale and reliability

## Content Type Analysis
- **Data Structure**: Time-series data with multiple metrics (requests, performance, database)
- **Key Relationships**: Request volume correlates with database operations; CPU/Wall times indicate performance
- **Visual Opportunities**: Bar chart for daily requests, numbered stats for KPIs, trend arrows, database usage visualization

## Key Data Points (Verbatim)
- "7日总请求: 4,779,300"
- "7日总错误: 0"
- "峰值日: 2026-06-17 (2,466,667 请求)"
- "日均请求: 682,757"
- "CPU P50: ~10ms | P99: ~200-400ms"
- "Wall P50: ~20ms | P99: ~500ms-10s"
- "D1 读取查询: ~177,988"
- "D1 写入查询: ~1,264,308"
- "D1 读取行数: ~475,779,825"
- "D1 写入行数: ~5,021,210"
- "状态码: 99.98% success"
- "2026-06-11: 部署首日"

## Layout × Style Signals
- Content type: Data/Metrics → suggests dashboard, dense-modules
- Tone: Technical yet celebratory → suggests morandi-journal, corporate-memphis
- Audience: Social media (QQ空间) → suggests morandi-journal (warm, hand-drawn, cozy)
- Complexity: Moderate with 12 data points → suggests dense-modules layout

## Design Instructions (from user input)
- Generate a beautiful infographic suitable for sharing on QQ空间 (Chinese social media)
- Portrait aspect ratio (9:16) for mobile viewing
- High-density modular layout with warm Morandi color tones
- Emphasis on key numbers: total requests, zero errors, daily trends
- Must be visually impressive for social sharing

## Recommended Combinations (user confirmed)
1. **dense-modules + morandi-journal**: Portrait mode 9:16. High-density modules with hand-drawn doodle warmth.
2. backend: baoyu-image-gen (OpenAI DALL-E)
