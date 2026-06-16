"use client"

import { useContext } from "react"
import { PremiumContext, type PremiumState } from "./PremiumProvider"

const DEV_LICENSE_KEY = "cx_DEV_DEV_DEV_DEV_DEV_DEV_DEV"

export function usePremium(): PremiumState {
  const ctx = useContext(PremiumContext)

  // Feature flag: if premium mode is disabled, everyone is premium
  if (process.env.NEXT_PUBLIC_PREMIUM_MODE !== "true") {
    // In development: all-local, no cloud calls.
    // Default to non-premium; activate with dev key to test premium features.
    if (process.env.NODE_ENV === "development") {
      const storedKey = localStorage.getItem("cortex:license-key")
      const isDevPremium = storedKey === DEV_LICENSE_KEY
      return {
        isPremium: isDevPremium,
        licenseKey: isDevPremium ? DEV_LICENSE_KEY : null,
        isLoading: false,
        error: null,
        activateLicense: async (key: string) => {
          if (key === DEV_LICENSE_KEY) {
            localStorage.setItem("cortex:license-key", DEV_LICENSE_KEY)
            localStorage.setItem("cortex:premium", JSON.stringify({ version: 2, timestamp: Date.now() }))
            return true
          }
          return false
        },
        clearLicense: () => {
          localStorage.removeItem("cortex:license-key")
          localStorage.removeItem("cortex:premium")
        },
        syncNow: async () => {},
        lastSyncAt: null,
        expiresAt: null,
        deviceCount: 0,
        maxDevices: 99,
      }
    }

    return {
      isPremium: true,
      licenseKey: null,
      isLoading: false,
      error: null,
      activateLicense: async () => true,
      clearLicense: () => {},
      syncNow: async () => {},
      lastSyncAt: null,
      expiresAt: null,
      deviceCount: 0,
      maxDevices: 3,
    }
  }

  return ctx
}
