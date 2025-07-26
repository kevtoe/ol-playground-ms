"use client"

import {
  Trash2,
  MousePointer2,
  RectangleHorizontal,
  Circle,
  Trash,
  PencilLine,
  TriangleRight,
  UnfoldVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

const tools = [
  { id: "select", icon: MousePointer2, tooltip: "Select, Edit & Move" },
  { id: "draw-line", icon: PencilLine, tooltip: "Draw Line" },
  { id: "draw-polygon", icon: TriangleRight, tooltip: "Draw Polygon" },
  { id: "draw-rectangle", icon: RectangleHorizontal, tooltip: "Draw Rectangle" },
  { id: "draw-circle", icon: Circle, tooltip: "Draw Circle" },
  { id: "offset", icon: UnfoldVertical, tooltip: "Offset Line" },
  { id: "delete", icon: Trash, tooltip: "Delete Feature" },
]

interface ToolbarProps {
  currentMode: string
  setMode: (mode: string) => void
  clearAll: () => void
  disabled: boolean
}

export function Toolbar({ currentMode, setMode, clearAll, disabled }: ToolbarProps) {
  return (
    <TooltipProvider>
      <Card className="absolute bottom-4 left-4 w-auto z-20">
        <CardContent className="p-2 flex items-center gap-1 flex-wrap">
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={currentMode === tool.id ? "default" : "outline"}
                  size="icon"
                  onClick={() => setMode(tool.id)}
                  disabled={disabled}
                >
                  <tool.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tool.tooltip}</TooltipContent>
            </Tooltip>
          ))}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="destructive" size="icon" onClick={clearAll} disabled={disabled}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear All</TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
