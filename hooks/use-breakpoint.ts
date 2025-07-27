"use client"

import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 680

export function useBreakpoint() {
  const [isMobile, setIsMobile] = useState(false)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const checkBreakpoint = () => {
      const currentWidth = window.innerWidth
      setWidth(currentWidth)
      
      // Check if user has bypassed the warning
      const forceDesktop = sessionStorage.getItem('forceDesktop') === 'true'
      const mobile = currentWidth < MOBILE_BREAKPOINT && !forceDesktop
      setIsMobile(mobile)
    }

    // Check immediately
    checkBreakpoint()

    // Check on resize (without page reload)
    const handleResize = () => {
      checkBreakpoint()
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return { isMobile, width }
}