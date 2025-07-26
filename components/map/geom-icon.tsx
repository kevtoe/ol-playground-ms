"use client"

import { PencilLine, TriangleRight, Circle, RectangleHorizontal } from "lucide-react"

interface GeomIconProps {
  geomType: string
  className?: string
}

export function GeomIcon({ geomType, className = "h-4 w-4" }: GeomIconProps) {
  switch (geomType) {
    case "LineString":
      return <PencilLine className={className} />
    case "Polygon":
      return <TriangleRight className={className} />
    case "Circle":
      // Check if it's a box-drawn rectangle
      if (geomType === "Circle" && (window as any).ol?.interaction.Draw.createBox()) {
        return <RectangleHorizontal className={className} />
      }
      return <Circle className={className} />
    default:
      return <PencilLine className={className} />
  }
}
