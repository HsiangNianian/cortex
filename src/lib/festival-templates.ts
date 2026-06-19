export interface FestivalTemplate {
  id: string
  name: Record<string, string>
  cssClass: string
  icon: string
  /** [month, day] — 1-based month */
  startDate: [number, number]
  endDate: [number, number]
}

export const FESTIVAL_TEMPLATES: FestivalTemplate[] = [
  {
    id: "dragonboat",
    name: {
      "zh-CN": "端午节",
      en: "Dragon Boat Fest",
      ja: "端午節",
    },
    cssClass: "festival-dragonboat",
    icon: "🎋",
    startDate: [6, 16],
    endDate: [6, 22],
  },
]

function dateToKey(month: number, day: number): number {
  return month * 100 + day
}

export function getActiveFestivals(): FestivalTemplate[] {
  const now = new Date()
  const today = dateToKey(now.getMonth() + 1, now.getDate())

  return FESTIVAL_TEMPLATES.filter((t) => {
    const start = dateToKey(t.startDate[0], t.startDate[1])
    const end = dateToKey(t.endDate[0], t.endDate[1])

    if (start <= end) {
      return today >= start && today <= end
    }
    //跨越年份（如 12/25 → 1/5）
    return today >= start || today <= end
  })
}

export function getTemplateById(id: string): FestivalTemplate | undefined {
  return FESTIVAL_TEMPLATES.find((t) => t.id === id)
}
