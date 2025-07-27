"use client"

import React from "react"
import { 
  Minus, 
  Square, 
  Circle, 
  Waves 
} from "lucide-react"
import type { LayerType } from "@/lib/types"

interface LayerTypeIconProps {
  type: LayerType
  className?: string
}

export function LayerTypeIcon({ type, className = "" }: LayerTypeIconProps) {
  switch (type) {
    case 'line':
      return <Minus className={className} />
    case 'polygon':
      return <Square className={className} />
    case 'circle':
      return <Circle className={className} />
    case 'bezier':
      return <Waves className={className} />
    default:
      return <Minus className={className} />
  }
}