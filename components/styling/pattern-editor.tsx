"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import type { FillPatternConfig } from "@/lib/types"

interface PatternEditorProps {
  pattern: FillPatternConfig
  updatePattern: (newPattern: Partial<FillPatternConfig>) => void
}

export function PatternEditor({ pattern, updatePattern }: PatternEditorProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="pattern">
        <AccordionTrigger>Fill Pattern</AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pattern-type">Type</Label>
            <Select value={pattern.type} onValueChange={(value) => updatePattern({ type: value as any })}>
              <SelectTrigger id="pattern-type">
                <SelectValue placeholder="Pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="hatch">Hatch</SelectItem>
                <SelectItem value="cross">Cross</SelectItem>
                <SelectItem value="dot">Dot</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="square">Square</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {pattern.type !== "none" && (
            <div className="space-y-4 pl-2 border-l-2 ml-2">
              <div className="space-y-2">
                <Label htmlFor="pattern-color">Color</Label>
                <Input
                  id="pattern-color"
                  type="color"
                  value={pattern.color}
                  onChange={(e) => updatePattern({ color: e.target.value })}
                  className="p-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pattern-size">Size</Label>
                <Slider
                  id="pattern-size"
                  min={1}
                  max={20}
                  step={1}
                  value={[pattern.size]}
                  onValueChange={([value]) => updatePattern({ size: value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pattern-spacing">Spacing</Label>
                <Slider
                  id="pattern-spacing"
                  min={1}
                  max={50}
                  step={1}
                  value={[pattern.spacing]}
                  onValueChange={([value]) => updatePattern({ spacing: value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pattern-angle">Angle</Label>
                <Slider
                  id="pattern-angle"
                  min={0}
                  max={180}
                  step={1}
                  value={[pattern.angle]}
                  onValueChange={([value]) => updatePattern({ angle: value })}
                />
              </div>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
