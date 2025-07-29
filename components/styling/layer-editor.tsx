"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react"
import { PatternEditor } from "./pattern-editor"
import { ColorInput } from "./color-input"
import type { StyleLayer } from "@/lib/types"

interface LayerEditorProps {
  layer: StyleLayer
  index: number
  totalLayers: number
  updateLayerStyle: (layerId: string, newLayerStyle: Partial<StyleLayer>) => void
  removeLayer: (layerId: string) => void
  moveLayer: (layerId: string, direction: "up" | "down") => void
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
  const handleUpdate = (field: keyof StyleLayer, value: any) => {
    updateLayerStyle(layer.id, { [field]: value })
  }

  const isPolygon = selectedGeomType === "Polygon" || selectedGeomType === "Circle"

  return (
    <TooltipProvider>
      <Accordion type="single" collapsible defaultValue="item-1" className="w-full border rounded-md px-2">
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger>
            <div className="flex items-center justify-between w-full pr-2">
              <span>Layer {index + 1}</span>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="inline-flex items-center justify-center h-6 w-6 rounded hover:bg-accent hover:text-accent-foreground cursor-pointer disabled:opacity-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (index !== 0) moveLayer(layer.id, "up")
                      }}
                      style={{ opacity: index === 0 ? 0.5 : 1, cursor: index === 0 ? 'not-allowed' : 'pointer' }}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Move Up</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="inline-flex items-center justify-center h-6 w-6 rounded hover:bg-accent hover:text-accent-foreground cursor-pointer disabled:opacity-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (index !== totalLayers - 1) moveLayer(layer.id, "down")
                      }}
                      style={{ opacity: index === totalLayers - 1 ? 0.5 : 1, cursor: index === totalLayers - 1 ? 'not-allowed' : 'pointer' }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Move Down</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="inline-flex items-center justify-center h-6 w-6 rounded hover:bg-destructive/20 hover:text-destructive cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (totalLayers > 1) removeLayer(layer.id)
                      }}
                      style={{ opacity: totalLayers <= 1 ? 0.5 : 1, cursor: totalLayers <= 1 ? 'not-allowed' : 'pointer' }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Remove Layer</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <ColorInput
                id={`stroke-color-${layer.id}`}
                label="Stroke"
                value={layer.strokeColor}
                onChange={(value) => handleUpdate("strokeColor", value)}
              />
              {isPolygon && (
                <ColorInput
                  id={`fill-color-${layer.id}`}
                  label="Fill"
                  value={layer.fillColor}
                  onChange={(value) => handleUpdate("fillColor", value)}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`stroke-width-${layer.id}`}>Stroke Width</Label>
              <Slider
                id={`stroke-width-${layer.id}`}
                min={0}
                max={50}
                step={1}
                value={[layer.strokeWidth]}
                onValueChange={([value]) => handleUpdate("strokeWidth", value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`stroke-opacity-${layer.id}`}>Stroke Opacity</Label>
              <Slider
                id={`stroke-opacity-${layer.id}`}
                min={0}
                max={1}
                step={0.1}
                value={[layer.strokeOpacity]}
                onValueChange={([value]) => handleUpdate("strokeOpacity", value)}
              />
            </div>
            {isPolygon && (
              <div className="space-y-2">
                <Label htmlFor={`fill-opacity-${layer.id}`}>Fill Opacity</Label>
                <Slider
                  id={`fill-opacity-${layer.id}`}
                  min={0}
                  max={1}
                  step={0.1}
                  value={[layer.fillOpacity]}
                  onValueChange={([value]) => handleUpdate("fillOpacity", value)}
                />
              </div>
            )}
            {selectedGeomType === "LineString" && (
              <div className="space-y-2">
                <Label htmlFor={`offset-${layer.id}`}>Offset</Label>
                <Slider
                  id={`offset-${layer.id}`}
                  min={-20}
                  max={20}
                  step={1}
                  value={[layer.offset]}
                  onValueChange={([value]) => handleUpdate("offset", value)}
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`stroke-cap-${layer.id}`}>Stroke Cap</Label>
                <select
                  id={`stroke-cap-${layer.id}`}
                  value={layer.strokeCap}
                  onChange={(e) => handleUpdate("strokeCap", e.target.value as 'butt' | 'round' | 'square')}
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                >
                  <option value="butt">Butt</option>
                  <option value="round">Round</option>
                  <option value="square">Square</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`stroke-join-${layer.id}`}>Stroke Join</Label>
                <select
                  id={`stroke-join-${layer.id}`}
                  value={layer.strokeJoin}
                  onChange={(e) => handleUpdate("strokeJoin", e.target.value as 'bevel' | 'round' | 'miter')}
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                >
                  <option value="bevel">Bevel</option>
                  <option value="round">Round</option>
                  <option value="miter">Miter</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`dashed-${layer.id}`}>Dashed Line</Label>
                <Switch
                  id={`dashed-${layer.id}`}
                  checked={layer.dashed}
                  onCheckedChange={(checked) => handleUpdate("dashed", checked)}
                />
              </div>
            </div>
            {layer.dashed && (
              <div className="space-y-2">
                <Label>Dash Pattern</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor={`dash-length-${layer.id}`} className="text-xs">Length</Label>
                    <Input
                      id={`dash-length-${layer.id}`}
                      type="number"
                      min="1"
                      max="50"
                      value={layer.dashPattern?.[0] ?? 10}
                      onChange={(e) => {
                        const newPattern = [...(layer.dashPattern || [10, 10])]
                        newPattern[0] = parseInt(e.target.value) || 10
                        handleUpdate("dashPattern", newPattern)
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`dash-gap-${layer.id}`} className="text-xs">Gap</Label>
                    <Input
                      id={`dash-gap-${layer.id}`}
                      type="number"
                      min="1"
                      max="50"
                      value={layer.dashPattern?.[1] ?? 10}
                      onChange={(e) => {
                        const newPattern = [...(layer.dashPattern || [10, 10])]
                        newPattern[1] = parseInt(e.target.value) || 10
                        handleUpdate("dashPattern", newPattern)
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
            {isPolygon && (
              <PatternEditor
                pattern={layer.fillPattern}
                updatePattern={(newPattern) => handleUpdate("fillPattern", { ...layer.fillPattern, ...newPattern })}
              />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </TooltipProvider>
  )
}
