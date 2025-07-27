"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import type { ArrowConfig } from "@/lib/types"

interface ArrowEditorProps {
  arrows: ArrowConfig
  updateArrowStyle: (newArrowStyle: Partial<ArrowConfig>) => void
}

export function ArrowEditor({ arrows, updateArrowStyle }: ArrowEditorProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="arrows">
        <AccordionTrigger>Arrows</AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="arrow-enabled">Enable Arrows</Label>
            <Switch
              id="arrow-enabled"
              checked={arrows.enabled}
              onCheckedChange={(checked) => updateArrowStyle({ enabled: checked })}
            />
          </div>
          {arrows.enabled && (
            <div className="space-y-4 pl-2 border-l-2 ml-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="arrow-start"
                    checked={arrows.atStart}
                    onCheckedChange={(checked) => updateArrowStyle({ atStart: checked })}
                  />
                  <Label htmlFor="arrow-start">At Start</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="arrow-end"
                    checked={arrows.atEnd}
                    onCheckedChange={(checked) => updateArrowStyle({ atEnd: checked })}
                  />
                  <Label htmlFor="arrow-end">At End</Label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="arrow-along"
                  checked={arrows.alongPath}
                  onCheckedChange={(checked) => updateArrowStyle({ alongPath: checked })}
                />
                <Label htmlFor="arrow-along">Along Path</Label>
              </div>
              {arrows.alongPath && (
                <div className="space-y-2 pl-4">
                  <Label htmlFor="arrow-spacing">Spacing (map units)</Label>
                  <Slider
                    id="arrow-spacing"
                    min={50}
                    max={500}
                    step={10}
                    value={[arrows.spacing]}
                    onValueChange={([value]) => updateArrowStyle({ spacing: value })}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="arrow-color">Color</Label>
                  <Input
                    id="arrow-color"
                    type="color"
                    value={arrows.color}
                    onChange={(e) => updateArrowStyle({ color: e.target.value })}
                    className="p-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arrow-style">Style</Label>
                  <Select value={arrows.style} onValueChange={(value) => updateArrowStyle({ style: value as any })}>
                    <SelectTrigger id="arrow-style">
                      <SelectValue placeholder="Style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="triangle">Triangle</SelectItem>
                      <SelectItem value="chevron">Chevron</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrow-size">Size</Label>
                <Slider
                  id="arrow-size"
                  min={4}
                  max={40}
                  step={1}
                  value={[arrows.size]}
                  onValueChange={([value]) => updateArrowStyle({ size: value })}
                />
              </div>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
