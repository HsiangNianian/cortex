"use client"

import { type ReactNode } from "react"
import { FestivalTemplateProvider } from "./FestivalTemplateProvider"

export function FestivalWrapper({ children }: { children: ReactNode }) {
  return <FestivalTemplateProvider>{children}</FestivalTemplateProvider>
}
