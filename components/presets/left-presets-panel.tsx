"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Trash2 } from "lucide-react"
import type { Preset, FeatureStyle } from "@/lib/types"

interface LeftPresetsPanelProps {
  presets: Preset[]
  onApply: (style: FeatureStyle) => void
  onDelete: (name: string) => void
  disabled: boolean
}

export function LeftPresetsPanel({ presets, onApply, onDelete, disabled }: LeftPresetsPanelProps) {
  return (
    <Card className="w-64 bg-card/80 backdrop-blur-sm">
      <CardHeader className="p-2 border-b">
        <CardTitle className="text-sm font-medium">Apply a Preset</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64">
          <div className="p-2 space-y-1">
            {presets.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center p-4">No presets available.</p>
            ) : (
              presets.map((preset) => (
                <div key={preset.name} className="flex items-center gap-1 group">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-8 px-2"
                    onClick={() => onApply(preset.style)}
                    disabled={disabled}
                  >
                    {preset.name}
                  </Button>
                  {preset.isDeletable && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(preset.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Preset</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
