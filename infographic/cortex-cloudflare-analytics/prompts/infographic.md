Create a professional infographic following these specifications:

## Image Specifications

- **Type**: Infographic
- **Layout**: dense-modules — 6 information modules with compact spacing, each with a clear section marker
- **Style**: morandi-journal — hand-drawn doodle aesthetic, warm cream paper background, cozy bullet journal feel
- **Aspect Ratio**: 9:16 portrait (vertical, suitable for mobile social sharing)
- **Language**: Chinese (Simplified)

## Core Principles

- Follow the layout structure precisely for information architecture
- Apply style aesthetics consistently throughout
- Keep information concise, highlight keywords and core concepts
- Use ample whitespace for visual clarity
- Maintain clear visual hierarchy
- Numbers must be large and prominent

## Text Requirements

- All text must be in Chinese
- Main titles should be prominent and readable
- Key concepts should be visually emphasized
- Labels should be clear and appropriately sized

## Layout Guidelines (dense-modules)

- 6 distinct modules arranged vertically in a 9:16 portrait layout
- Every module contains concrete data: exact numbers, percentages, parameters
- Compact spacing with smaller text acceptable for data density
- Each module identified with a section label
- Numbers highlighted with accent colors, larger than body text

Modules:
1. **KPI Bar** (top, most prominent): 3 big numbers — total requests 478万, errors 0, peak day 247万
2. **Daily Trend Bar Chart**: 7 daily bars (6/11-6/17), highlight 6/17 with standout color
3. **Performance Gauges**: CPU P50 ~10ms, CPU P99 ~200-400ms, Wall P50 ~20ms, Wall P99 ~0.5-10s
4. **Database Stats Grid**: 4 cards — read queries 17.8万, write queries 126.4万, rows read 4.76亿, rows written 502万
5. **Zero Error Badge**: Status badge showing 99.98% success rate, 0 errors in 7 days
6. **Hourly Pattern**: Mini chart showing peak day hourly distribution, peak at UTC 9:00 with 23.2万/hour

## Style Guidelines (morandi-journal)

### Color Palette
- Background: Warm cream/beige with subtle paper texture (#F5F0E6)
- Primary: Muted teal/sage green (#7BA3A8) for headers and frames
- Secondary: Warm terracotta/orange (#D4956A) for highlights and numbers
- Line art: Dark charcoal brown (#4A4540)
- Soft highlights: Pale yellow (#F5E6C8)

### Visual Elements
- Hand-drawn doodle aesthetic with organic, slightly imperfect lines
- Washi tape strip decorations (diagonal stripes, beige and brown)
- Rounded card containers for modules
- Hand-drawn rulers, scales, and progress bars
- Smiley/frowny faces as quality indicators
- Dotted line frames around sections
- Connecting arrows and dotted lines between modules
- Corner decorations: tiny stars, sparkles, clouds
- Wavy line dividers between sections
- Callout bubbles for tips

### Typography
- Main title: Bold hand-lettered calligraphy style with decorative flourishes
- Module headers: Clean handwritten text in white on dark teal rounded badge
- Body text: Neat handwritten print style
- Numbers: Highlighted in terracotta, significantly larger than body text

### Avoid
- Flat vector icons or emoji
- Clean geometric shapes
- Stock illustration style
- Strict grid layout
- Pure white background
- Digital/corporate look

---

Generate the infographic based on the content below:

## Content

### Module 1: Core KPIs
- Title: "Cortex ☁️ 首周运营数据"
- Subtitle: "2026.06.11 — 2026.06.17"
- Big Number 1: "478万" — Label: "总请求"
- Big Number 2: "0" — Label: "错误" (with green checkmark)
- Big Number 3: "247万" — Label: "峰值日"

### Module 2: Daily Trend
- Title: "每日请求量趋势"
- Data points (date → requests):
  - 6/11 → 26.1万 (部署日)
  - 6/12 → 75.8万
  - 6/13 → 33.4万
  - 6/14 → 12.4万 ⬅️ 最低
  - 6/15 → 18.2万
  - 6/16 → 65.3万
  - 6/17 → 246.7万 🚀 峰值
- Annotation: "日均 68.3万请求"

### Module 3: Performance
- Title: "响应性能"
- CPU P50: ~10ms (green zone)
- CPU P99: ~200-400ms (yellow zone)
- Wall P50: ~20ms (green zone)
- Wall P99: ~0.5-10s (yellow-red zone)
- Annotation: "CPU P50 仅 10ms — 极速响应"

### Module 4: Database
- Title: "D1 数据库负载"
- Read Queries: "17.8万次"
- Write Queries: "126.4万次"
- Rows Read: "4.76亿行"
- Rows Written: "502万行"
- Annotation: "写入 : 读取 ≈ 7 : 1"

### Module 5: Reliability
- Title: "零错误运行"
- "7 天 · 0 错误 · 99.98% 成功率"
- "仅 532 次客户端断连 (0.02%)"
- Green badge/shield visual

### Module 6: Hourly Pattern
- Title: "峰值日 (6/17) 小时分布"
- Night (UTC 0-4): 2.8万→10.5万 (slow rise)
- Morning (UTC 4-9): 10.5万→23.2万 (fast growth) 
- Peak: "UTC 9:00 23.2万/小时" ⬆️
- Afternoon-Evening: gradual decline
- Bottom: "UTC 21:00 仅 2.8万"
- Annotation: "符合用户作息曲线"

Text labels (in Chinese):
- "Cortex ☁️ 首周运营数据" (main title)
- "2026.06.11 — 2026.06.17" (subtitle)
- Module section labels: "核心指标", "每日趋势", "响应性能", "数据库负载", "稳定性", "小时分布"
- All numeric values as specified above
- Footer: "数据来源: Cloudflare Analytics · 生成于 2026.06.18"
