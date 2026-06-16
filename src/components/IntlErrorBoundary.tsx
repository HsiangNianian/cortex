"use client"

import { NextIntlClientProvider } from "next-intl"
import type { ComponentProps, ReactNode } from "react"

type Props = ComponentProps<typeof NextIntlClientProvider> & {
  children: ReactNode
}

/**
 * Client-side wrapper around NextIntlClientProvider that suppresses
 * benign INVALID_MESSAGE errors during Turbopack HMR.
 *
 * onError must live on the client — Server Components cannot pass
 * functions as props to Client Components.
 */
export function IntlErrorBoundary({ children, ...props }: Props) {
  return (
    <NextIntlClientProvider
      {...props}
      onError={(error) => {
        // Benign: locale context briefly lost during HMR
        if (error.code === "INVALID_MESSAGE") return
        // Benign: environment formatting fallback
        if (error.code === "ENVIRONMENT_FALLBACK") return
        console.error(error)
      }}
    >
      {children}
    </NextIntlClientProvider>
  )
}
