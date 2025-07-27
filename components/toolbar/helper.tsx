"use client"

import { AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

interface HelperProps {
  currentMode: string
}

export function Helper({ currentMode }: HelperProps) {
  const getHelperText = () => {
    switch (currentMode) {
      case "select":
        return "Click to select, Shift+Click to multi-select, Shift+Drag to box-select. Drag points to modify."
      case "draw-line":
        return "Click to start drawing a line. Double-click to finish."
      case "draw-polygon":
        return "Click to start drawing a polygon. Double-click to finish."
      case "draw-circle":
        return "Click and drag to draw a circle."
      case "draw-rectangle":
        return "Click and drag to draw a rectangle."
      case "offset":
        return "Click and drag a line to create an offset copy. Click and drag a polygon to transform it."
      case "delete":
        return "Click on a feature to delete it."
      default:
        return "Select a tool to begin."
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" className="bg-card">
            <AlertCircle className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" align="start">
          <p>{getHelperText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
