"use client"

import { useState } from "react"
import { HelpCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

const toolInstructions: { [key: string]: { title: string; instructions: { key: string; action: string }[] } } = {
  select: {
    title: "Select, Edit & Move Tool",
    instructions: [
      { key: "Click", action: "Select a single feature." },
      { key: "Shift + Click", action: "Add or remove a feature from the current selection." },
      { key: "Shift + Drag", action: "Draw a box to select all features within it." },
      { key: "Drag Center Handle", action: "Move the entire feature." },
      { key: "Drag Vertex", action: "Modify the shape of the feature." },
    ],
  },
  "draw-line": {
    title: "Draw Line Tool",
    instructions: [
      { key: "Click", action: "Place a vertex." },
      { key: "Double-click", action: "Finish drawing the line." },
    ],
  },
  "draw-polygon": {
    title: "Draw Polygon Tool",
    instructions: [
      { key: "Click", action: "Place a vertex." },
      { key: "Double-click", action: "Finish drawing the polygon." },
    ],
  },
  "draw-rectangle": {
    title: "Draw Rectangle Tool",
    instructions: [
      { key: "Click and Drag", action: "Draw a rectangle." },
      { key: "Release", action: "Finish drawing." },
    ],
  },
  "draw-circle": {
    title: "Draw Circle Tool",
    instructions: [
      { key: "Click and Drag", action: "Draw a circle from the center out." },
      { key: "Release", action: "Finish drawing." },
    ],
  },
  offset: {
    title: "Offset Tool",
    instructions: [
      { key: "Click and Drag Line", action: "Create an offset copy of a line." },
      { key: "Click and Drag Polygon", action: "Scale a polygon or circle." },
    ],
  },
  delete: {
    title: "Delete Tool",
    instructions: [
      { key: "Hover", action: "Highlight a feature to be deleted." },
      { key: "Click", action: "Permanently delete the highlighted feature." },
    ],
  },
}

interface HelperProps {
  currentMode: string
}

export function Helper({ currentMode }: HelperProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const currentInstructions = toolInstructions[currentMode]

  return (
    <TooltipProvider>
      <div className="absolute top-4 left-4 z-20">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="bg-card">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isExpanded ? "Close Help" : "Show Help"}</TooltipContent>
        </Tooltip>

        {isExpanded && currentInstructions && (
          <Card className="mt-2 w-72">
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <CardTitle className="text-base">{currentInstructions.title}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ul className="space-y-2">
                {currentInstructions.instructions.map((item, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="font-semibold w-32 flex-shrink-0">{item.key}:</span>
                    <span className="text-muted-foreground">{item.action}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}
