"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react"
import { PatternEditor } from "./pattern-editor"
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        moveLayer(layer.id, "up")
                      }}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Move Up</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        moveLayer(layer.id, "down")
                      }}
                      disabled={index === totalLayers - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Move Down</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-destructive/20 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeLayer(layer.id)
                      }}
                      disabled={totalLayers <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove Layer</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`stroke-color-${layer.id}`}>Stroke</Label>
                <Input
                  id={`stroke-color-${layer.id}`}
                  type="color"
                  value={layer.strokeColor}
                  onChange={(e) => handleUpdate("strokeColor", e.target.value)}
                  className="p-1"
                />
              </div>
              {isPolygon && (
                <div className="space-y-2">
                  <Label htmlFor={`fill-color-${layer.id}`}>Fill</Label>
                  <Input
                    id={`fill-color-${layer.id}`}
                    type="color"
                    value={layer.fillColor}
                    onChange={(e) => handleUpdate("fillColor", e.target.value)}
                    className="p-1"
                  />
                </div>
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
