# Cortex Cloudflare 首周数据总览

## Overview
Cortex 在 Cloudflare Workers 上线首周（2026.6.11-6.17）运营数据：7日总请求 478万，零错误，日均 68万请求，峰值日达 247万。

## Learning Objectives
The viewer will understand:
1. Cortex 首周的流量规模与稳定性
2. 每日请求量变化趋势
3. 核心性能与数据库负载指标

---

## Section 1: 核心指标 Highlight (KPI Bar)

**Key Concept**: 首周最重要的 3 个数字

**Content**:
- 总请求: 4,779,300
- 总错误: 0
- 峰值日请求: 2,466,667 (6月17日)

**Visual Element**:
- Type: Big number highlight
- Three large numbers with icons/badges
- Green checkmark for "零错误"

**Text Labels**:
- Headline: "Cortex ☁️ 首周运营数据"
- Subhead: "2026.06.11 — 2026.06.17"
- Big numbers: "478万", "0", "247万"
- Labels: "总请求", "错误", "峰值日"

---

## Section 2: 每日请求量趋势 (Bar Chart)

**Key Concept**: 7日请求量从 12万逐步攀升至 247万

**Content**:
- 6/11: 261,396 (部署日)
- 6/12: 758,103
- 6/13: 334,372
- 6/14: 123,648 (最低)
- 6/15: 181,983
- 6/16: 653,131
- 6/17: 2,466,667 (峰值)

**Visual Element**:
- Type: Bar chart or visual bars with gradient colors
- Each bar sized proportionally
- Highlight 6/17 bar with standout color
- Trend arrow showing growth direction

**Text Labels**:
- Headline: "每日请求量趋势"
- X-axis: dates (6/11—6/17)
- Y-axis values at each bar
- Peak marker: "🚀 +278%"

---

## Section 3: 性能指标 (Specifications)

**Key Concept**: CPU 和 Wall 时间的中位数与 P99

**Content**:
- CPU P50: ~10ms
- CPU P99: ~200-400ms
- Wall P50: ~20ms
- Wall P99: ~0.5-10s

**Visual Element**:
- Type: Gauge/speedometer style
- Two rows: CPU Time and Wall Time
- Green zone (fast), yellow zone, red zone indicators

**Text Labels**:
- Headline: "响应性能"
- "CPU P50 仅 10ms — 极速响应"
- "Wall P99 < 10s — 长尾可控"

---

## Section 4: D1 数据库负载 (Database Stats)

**Key Concept**: D1 数据库读写规模

**Content**:
- 读取查询: ~17.8万次
- 写入查询: ~126.4万次
- 读取行数: ~4.76亿行
- 写入行数: ~502万行

**Visual Element**:
- Type: Icon + number grid
- 4 square cards with database-related icons
- Color-coded: read in teal, write in terracotta

**Text Labels**:
- Headline: "D1 数据库负载"
- Read: "读取 17.8万次 / 4.76亿行"
- Write: "写入 126.4万次 / 502万行"
- Note: "写入 : 读取 ≈ 7 : 1"

---

## Section 5: 稳定性与状态码 (Status Badge)

**Key Concept**: 零错误运行

**Content**:
- success: 99.98%
- clientDisconnected: 532次 (仅 0.02%)
- 总错误: 0

**Visual Element**:
- Type: Large badge/shield icon
- Green checkmark with "100% Uptime" feel
- Status breakdown pie or bar

**Text Labels**:
- Headline: "零错误运行"
- "7 天 · 0 错误 · 99.98% 成功率"
- "仅 532 次客户端断连 (0.02%)"

---

## Section 6: 峰值日小时分布 (Hourly Pattern)

**Key Concept**: 6月17日每小时请求分布，UTC 9:00 峰值

**Content**:
- UTC 0-4点: 2.8万→10.5万 (缓慢爬升)
- UTC 4-9点: 10.5万→23.2万 (快速增长)
- UTC 9点峰值: 232,028/小时
- UTC 9-21点: 逐渐回落至 2.8万

**Visual Element**:
- Type: Mini line chart or small bar row
- 24-hour timeline
- Highlight peak at UTC 09:00

**Text Labels**:
- Headline: "峰值日 (6/17) 小时分布"
- Peak label: "峰值 UTC 9:00 23.2万/小时"
- "符合用户作息曲线"

---

## Data Points (Verbatim)

### Statistics
- "7日总请求: 4,779,300"
- "7日总错误: 0"
- "峰值日: 2026-06-17 (2,466,667 请求)"
- "日均请求: 682,757"
- "CPU P50: ~10ms"
- "CPU P99: 200-400ms"
- "Wall P50: ~20ms"
- "D1 读取查询: ~177,988"
- "D1 写入查询: ~1,264,308"
- "D1 读取行数: ~475,779,825"
- "D1 写入行数: ~5,021,210"
- "状态码 success: 99.98%"
- "部署日: 2026年6月11日"

---

## Design Instructions

### Style Preferences
- Morandi journal style: warm cream paper background, hand-drawn doodle aesthetic
- Color palette: cream/beige background (#F5F0E6), muted teal (#7BA3A8) for headers, warm terracotta (#D4956A) for numbers
- Hand-drawn feel: organic lines, washi tape decorations, doodle accents

### Layout Preferences
- dense-modules layout: 6 modules, compact spacing
- Portrait 9:16 aspect ratio for mobile sharing
- Each module with clear boundary
- Numbers prominently displayed

### Other Requirements
- Target platform: QQ空间 (Chinese social media)
- All text in Chinese
- Professional yet warm and approachable tone
- Must be visually impressive for social sharing
