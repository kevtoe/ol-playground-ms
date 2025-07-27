"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MousePointer2, Trash2, Spline, RectangleHorizontal, Circle, Eraser, Move, Square, Waves } from "lucide-react"

interface ToolbarProps {
  currentMode: string
  setMode: (mode: string) => void
  clearAll: () => void
  disabled: boolean
}

export function Toolbar({ currentMode, setMode, clearAll, disabled }: ToolbarProps) {
  const tools = [
    { value: "select", icon: <MousePointer2 />, label: "Select / Modify" },
    { value: "draw-line", icon: <Spline />, label: "Draw Line" },
    { value: "draw-bezier", icon: <Waves />, label: "Draw Bezier Curve" },
    { value: "draw-polygon", icon: <RectangleHorizontal />, label: "Draw Polygon" },
    { value: "draw-circle", icon: <Circle />, label: "Draw Circle" },
    { value: "draw-rectangle", icon: <Square />, label: "Draw Rectangle" },
    { value: "offset", icon: <Move />, label: "Offset / Transform" },
    { value: "delete", icon: <Trash2 />, label: "Delete" },
  ]

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
      <TooltipProvider>
        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-card shadow-lg border">
          <ToggleGroup
            type="single"
            value={currentMode}
            onValueChange={(value) => {
              if (value) setMode(value)
            }}
            disabled={disabled}
          >
            {tools.map((tool) => (
              <Tooltip key={tool.value}>
                <ToggleGroupItem value={tool.value} aria-label={tool.label} asChild>
                  <TooltipTrigger>
                    {tool.icon}
                  </TooltipTrigger>
                </ToggleGroupItem>
                <TooltipContent>
                  <p>{tool.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </ToggleGroup>
          <Separator orientation="vertical" className="h-6" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={clearAll} disabled={disabled}>
                <Eraser />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear All Features</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}
