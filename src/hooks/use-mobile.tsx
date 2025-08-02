"use client"

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    checkIsMobile() // Set initial value
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIs-Mobile)
  }, [])

  return isMobile
}
