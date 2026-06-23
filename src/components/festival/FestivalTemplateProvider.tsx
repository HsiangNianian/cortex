"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { FESTIVAL_TEMPLATES, getActiveFestivals, getTemplateById, type FestivalTemplate } from "@/lib/festival-templates"

const STORAGE_KEY = "cortex-festival-template"

interface FestivalTemplateContextValue {
  activeTemplate: FestivalTemplate | null
  availableTemplates: FestivalTemplate[]
  setActiveTemplate: (id: string | null) => void
  clearTemplate: () => void
}

const FestivalTemplateContext = createContext<FestivalTemplateContextValue>({
  activeTemplate: null,
  availableTemplates: FESTIVAL_TEMPLATES,
  setActiveTemplate: () => {},
  clearTemplate: () => {},
})

export function useFestivalTemplate() {
  return useContext(FestivalTemplateContext)
}

export function FestivalTemplateProvider({ children }: { children: ReactNode }) {
  const [activeTemplate, setActiveTemplateState] = useState<FestivalTemplate | null>(null)
  const [ready, setReady] = useState(false)

  // Init: read localStorage (only if still in date) -> auto-detect -> apply class
  useEffect(() => {
    const stored = (() => {
      try {
        return localStorage.getItem(STORAGE_KEY)
      } catch {
        return null
      }
    })()

    let resolved: FestivalTemplate | null = null

    if (stored) {
      // Only restore from localStorage if the festival is still in date
      const active = getActiveFestivals()
      resolved = active.find((t) => t.id === stored) ?? null
    }

    if (!resolved) {
      const active = getActiveFestivals()
      resolved = active.length > 0 ? active[0] : null
    }

    setActiveTemplateState(resolved)
    setReady(true)

    return () => {
      // Cleanup on unmount
      if (resolved) {
        document.documentElement.classList.remove(resolved.cssClass)
      }
    }
  }, [])

  // Sync class on <html> whenever activeTemplate changes
  useEffect(() => {
    // Remove all festival classes
    for (const t of FESTIVAL_TEMPLATES) {
      document.documentElement.classList.remove(t.cssClass)
    }

    if (activeTemplate) {
      document.documentElement.classList.add(activeTemplate.cssClass)
    }
  }, [activeTemplate])

  const setActiveTemplate = useCallback((id: string | null) => {
    const tpl = id ? getTemplateById(id) ?? null : null
    setActiveTemplateState(tpl)
    try {
      if (tpl) {
        localStorage.setItem(STORAGE_KEY, tpl.id)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // localStorage unavailable
    }
  }, [])

  const clearTemplate = useCallback(() => {
    setActiveTemplate(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // localStorage unavailable
    }
  }, [])

  // Don't render anything different until ready
  // so server and first client render stay in sync
  if (!ready) {
    return <>{children}</>
  }

  return (
    <FestivalTemplateContext.Provider
      value={{
        activeTemplate,
        availableTemplates: FESTIVAL_TEMPLATES,
        setActiveTemplate,
        clearTemplate,
      }}
    >
      {children}
    </FestivalTemplateContext.Provider>
  )
}
