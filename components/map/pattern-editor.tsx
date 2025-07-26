"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { StyleLayer, FillPatternConfig } from "@/lib/types"

interface PatternEditorProps {
  layer: StyleLayer
  updateLayerStyle: (id: string, newStyle: Partial<StyleLayer>) => void
}

export function PatternEditor({ layer, updateLayerStyle }: PatternEditorProps) {
  const updatePattern = (newPattern: Partial<FillPatternConfig>) => {
    updateLayerStyle(layer.id, { fillPattern: { ...layer.fillPattern, ...newPattern } })
  }

  return (
    <div className="space-y-3 pt-2">
      <Label className="text-sm font-medium">Fill Pattern</Label>
      <Select value={layer.fillPattern.type} onValueChange={(value) => updatePattern({ type: value as any })}>
        <SelectTrigger>
          <SelectValue placeholder="Select pattern" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None (Solid)</SelectItem>
          <SelectItem value="hatch">Hatch</SelectItem>
          <SelectItem value="cross">Cross</SelectItem>
          <SelectItem value="dot">Dot</SelectItem>
          <SelectItem value="circle">Circle</SelectItem>
          <SelectItem value="square">Square</SelectItem>
        </SelectContent>
      </Select>

      {layer.fillPattern.type !== "none" && (
        <div className="space-y-3 pl-2 border-l-2">
          <div className="flex items-center gap-2">
            <Label className="text-xs">Color</Label>
            <Input
              type="color"
              value={layer.fillPattern.color}
              onChange={(e) => updatePattern({ color: e.target.value })}
              className="p-1 h-8 w-14 ml-auto"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Size</Label>
            <Slider
              value={[layer.fillPattern.size]}
              onValueChange={([val]) => updatePattern({ size: val })}
              min={1}
              max={20}
              step={1}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Spacing</Label>
            <Slider
              value={[layer.fillPattern.spacing]}
              onValueChange={([val]) => updatePattern({ spacing: val })}
              min={1}
              max={50}
              step={1}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Angle</Label>
            <Slider
              value={[layer.fillPattern.angle]}
              onValueChange={([val]) => updatePattern({ angle: val })}
              min={0}
              max={180}
              step={5}
            />
          </div>
        </div>
      )}
    </div>
  )
}
