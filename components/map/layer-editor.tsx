"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react"
import { PatternEditor } from "./pattern-editor"
import type { StyleLayer } from "@/lib/types"

interface LayerEditorProps {
  layer: StyleLayer
  index: number
  totalLayers: number
  updateLayerStyle: (id: string, newStyle: Partial<StyleLayer>) => void
  removeLayer: (id: string) => void
  moveLayer: (id: string, direction: "up" | "down") => void
  selectedGeomType: string
}

export function LayerEditor({
  layer,
  index,
  totalLayers,
  updateLayerStyle,
  removeLayer,
  moveLayer,
  selectedGeomType,
}: LayerEditorProps) {
  const isPolygon = selectedGeomType === "Polygon" || selectedGeomType === "Circle"
  const isLine = selectedGeomType === "LineString"

  return (
    <TooltipProvider>
      <div className="p-3 border rounded-md space-y-4 relative bg-card">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-base">Layer {index + 1}</Label>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveLayer(layer.id, "up")}
                  disabled={index === 0}
                  className="h-6 w-6"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move Up</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveLayer(layer.id, "down")}
                  disabled={index === totalLayers - 1}
                  className="h-6 w-6"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move Down</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLayer(layer.id)}
                  disabled={totalLayers <= 1}
                  className="h-6 w-6 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove Layer</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Stroke controls */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Stroke</Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={layer.strokeColor}
              onChange={(e) => updateLayerStyle(layer.id, { strokeColor: e.target.value })}
              className="p-1 h-8 w-14"
            />
            <Input
              type="number"
              value={layer.strokeWidth}
              onChange={(e) => updateLayerStyle(layer.id, { strokeWidth: Number(e.target.value) })}
              className="w-20 h-8"
              min={0}
            />
            <Slider
              value={[layer.strokeWidth]}
              onValueChange={([val]) => updateLayerStyle(layer.id, { strokeWidth: val })}
              min={0}
              max={50}
              step={1}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`stroke-opacity-${layer.id}`} className="text-xs">
              Opacity
            </Label>
            <Slider
              id={`stroke-opacity-${layer.id}`}
              value={[layer.strokeOpacity]}
              onValueChange={([val]) => updateLayerStyle(layer.id, { strokeOpacity: val })}
              min={0}
              max={1}
              step={0.05}
            />
          </div>
        </div>

        {/* Fill and Pattern controls */}
        {isPolygon && (
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm font-medium">Fill</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={layer.fillColor}
                onChange={(e) => updateLayerStyle(layer.id, { fillColor: e.target.value })}
                className="p-1 h-8 w-14"
              />
              <div className="flex-1 space-y-1">
                <Label htmlFor={`fill-opacity-${layer.id}`} className="text-xs">
                  Opacity
                </Label>
                <Slider
                  id={`fill-opacity-${layer.id}`}
                  value={[layer.fillOpacity]}
                  onValueChange={([val]) => updateLayerStyle(layer.id, { fillOpacity: val })}
                  min={0}
                  max={1}
                  step={0.05}
                />
              </div>
            </div>
            <PatternEditor layer={layer} updateLayerStyle={updateLayerStyle} />
          </div>
        )}

        {/* Offset controls */}
        {isLine && (
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm font-medium">Offset</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={layer.offset}
                onChange={(e) => updateLayerStyle(layer.id, { offset: Number(e.target.value) })}
                className="w-20 h-8"
              />
              <Slider
                value={[layer.offset]}
                onValueChange={([val]) => updateLayerStyle(layer.id, { offset: val })}
                min={-50}
                max={50}
                step={1}
              />
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
