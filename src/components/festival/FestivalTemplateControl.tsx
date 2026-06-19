"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { useFestivalTemplate } from "./FestivalTemplateProvider"

export function FestivalTemplateControl() {
  const t = useTranslations()
  const { activeTemplate, availableTemplates, clearTemplate, setActiveTemplate } =
    useFestivalTemplate()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    queueMicrotask(() => setMounted(true))
  }, [])

  // No festivals configured — don't render
  if (availableTemplates.length === 0) return null

  // Placeholder until mounted (hydration safety)
  if (!mounted) return <div className="h-9 w-9" />

  // Determine next action
  const nextTemplateId = activeTemplate
    ? null // currently active → turn off
    : availableTemplates[0]?.id ?? null

  function handleClick() {
    if (nextTemplateId === null) {
      clearTemplate()
    } else {
      setActiveTemplate(nextTemplateId)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="gap-1 px-2 text-xs"
    >
      {activeTemplate ? (
        <>
          <span className="text-base leading-none">{activeTemplate.icon}</span>
          <span className="hidden sm:inline">{t(`festival.${activeTemplate.id}`)}</span>
        </>
      ) : (
        <>
          <span className="text-base leading-none">{availableTemplates[0].icon}</span>
          <span className="hidden sm:inline">{t("festival.none")}</span>
        </>
      )}
    </Button>
  )
}
