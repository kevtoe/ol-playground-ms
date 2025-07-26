"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ArrowConfig } from "@/lib/types"

interface ArrowEditorProps {
  arrows: ArrowConfig
  updateArrowStyle: (newStyle: Partial<ArrowConfig>) => void
}

export function ArrowEditor({ arrows, updateArrowStyle }: ArrowEditorProps) {
  return (
    <div className="p-3 border rounded-md space-y-4 bg-card">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="enable-arrows"
          checked={arrows.enabled}
          onCheckedChange={(checked) => updateArrowStyle({ enabled: !!checked })}
        />
        <Label htmlFor="enable-arrows" className="font-bold text-base">
          Arrows
        </Label>
      </div>

      {arrows.enabled && (
        <div className="space-y-3 pl-2 border-l-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="arrow-start"
                checked={arrows.atStart}
                onCheckedChange={(checked) => updateArrowStyle({ atStart: !!checked })}
              />
              <Label htmlFor="arrow-start" className="text-xs">
                At Start
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="arrow-end"
                checked={arrows.atEnd}
                onCheckedChange={(checked) => updateArrowStyle({ atEnd: !!checked })}
              />
              <Label htmlFor="arrow-end" className="text-xs">
                At End
              </Label>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="arrow-along"
              checked={arrows.alongPath}
              onCheckedChange={(checked) => updateArrowStyle({ alongPath: !!checked })}
            />
            <Label htmlFor="arrow-along" className="text-xs">
              Along Path
            </Label>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Label className="text-xs">Color</Label>
            <Input
              type="color"
              value={arrows.color}
              onChange={(e) => updateArrowStyle({ color: e.target.value })}
              className="p-1 h-8 w-14 ml-auto"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Size</Label>
            <Slider
              value={[arrows.size]}
              onValueChange={([val]) => updateArrowStyle({ size: val })}
              min={1}
              max={50}
              step={1}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Style</Label>
            <Select value={arrows.style} onValueChange={(value) => updateArrowStyle({ style: value as any })}>
              <SelectTrigger>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="triangle">Triangle</SelectItem>
                <SelectItem value="chevron">Chevron</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {arrows.alongPath && (
            <div className="space-y-1">
              <Label className="text-xs">Spacing</Label>
              <Slider
                value={[arrows.spacing]}
                onValueChange={([val]) => updateArrowStyle({ spacing: val })}
                min={50}
                max={500}
                step={10}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
