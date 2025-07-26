"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2 } from "lucide-react"
import type { Preset, FeatureStyle } from "@/lib/types"

interface PresetsPanelProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  presets: Preset[]
  onApply: (style: FeatureStyle) => void
  onDelete: (name: string) => void
  disabled: boolean
}

export function PresetsPanel({ isOpen, onOpenChange, presets, onApply, onDelete, disabled }: PresetsPanelProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Style Presets</SheetTitle>
          <SheetDescription>Apply a saved style preset to the selected feature(s).</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-8rem)] my-4 pr-4">
          <div className="space-y-2">
            {presets.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p>No presets saved yet.</p>
                <p className="text-sm">Style a feature and save it as a preset.</p>
              </div>
            )}
            {presets.map((preset) => (
              <div key={preset.name} className="flex items-center justify-between p-2 border rounded-md">
                <span className="font-medium truncate">{preset.name}</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => onApply(preset.style)} disabled={disabled}>
                    Apply
                  </Button>
                  <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => onDelete(preset.name)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <SheetFooter>{/* Optional footer content can go here */}</SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
