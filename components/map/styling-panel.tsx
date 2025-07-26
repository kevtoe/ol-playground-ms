"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus, Copy, ClipboardPaste, X } from "lucide-react"
import { LayerEditor } from "./layer-editor"
import { ArrowEditor } from "./arrow-editor"
import { GeomIcon } from "./geom-icon"
import type { FeatureStyle, StyleLayer } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { DEFAULT_LINE_STYLE } from "@/lib/style-manager"

interface StylingPanelProps {
  selectedFeatures: any[]
  featureStylesRef: React.MutableRefObject<Map<string, FeatureStyle>>
  applyStyleToSelectedFeatures: (newStyle: FeatureStyle) => void
  onDeselectAll: () => void
}

export function StylingPanel({
  selectedFeatures,
  featureStylesRef,
  applyStyleToSelectedFeatures,
  onDeselectAll,
}: StylingPanelProps) {
  const { toast } = useToast()
  const isMultiSelect = selectedFeatures.length > 1
  const singleFeature = isMultiSelect ? null : selectedFeatures[0]

  const getInitialStyle = () => {
    if (singleFeature) {
      const uid = (window as any).ol.util.getUid(singleFeature)
      return JSON.parse(JSON.stringify(featureStylesRef.current.get(uid) || DEFAULT_LINE_STYLE))
    }
    return JSON.parse(JSON.stringify(DEFAULT_LINE_STYLE))
  }

  const [currentStyle, setCurrentStyle] = useState<FeatureStyle>(getInitialStyle)
  const [styleCode, setStyleCode] = useState(() => JSON.stringify(getInitialStyle(), null, 2))

  // When the selected feature changes, reset the component's state to match.
  useEffect(() => {
    const newStyle = getInitialStyle()
    setCurrentStyle(newStyle)
  }, [selectedFeatures, featureStylesRef])

  // Sync the style object to the JSON text area whenever it changes.
  useEffect(() => {
    setStyleCode(JSON.stringify(currentStyle, null, 2))
  }, [currentStyle])

  const updateSingleFeatureStyle = (newStyle: FeatureStyle) => {
    setCurrentStyle(newStyle)
    applyStyleToSelectedFeatures(newStyle)
  }

  const updateLayerStyle = (layerId: string, newLayerStyle: Partial<StyleLayer>) => {
    const newLayers = currentStyle.layers.map((l) => (l.id === layerId ? { ...l, ...newLayerStyle } : l))
    updateSingleFeatureStyle({ ...currentStyle, layers: newLayers })
  }

  const addLayer = () => {
    const newLayer: StyleLayer = {
      id: `layer${Date.now()}`,
      strokeColor: "#000000",
      strokeWidth: 2,
      strokeOpacity: 1,
      fillColor: "#000000",
      fillOpacity: 0.4,
      fillPattern: { type: "none", color: "#000000", size: 3, spacing: 8, angle: 0 },
      offset: 0,
    }
    updateSingleFeatureStyle({ ...currentStyle, layers: [...currentStyle.layers, newLayer] })
  }

  const removeLayer = (layerId: string) => {
    const newLayers = currentStyle.layers.filter((l) => l.id !== layerId)
    updateSingleFeatureStyle({ ...currentStyle, layers: newLayers })
  }

  const moveLayer = (layerId: string, direction: "up" | "down") => {
    const layers = [...currentStyle.layers]
    const index = layers.findIndex((l) => l.id === layerId)
    if (index === -1) return

    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= layers.length) return
    ;[layers[index], layers[newIndex]] = [layers[newIndex], layers[index]]

    updateSingleFeatureStyle({ ...currentStyle, layers })
  }

  const handleApplyCode = () => {
    try {
      const newStyle = JSON.parse(styleCode)
      if (!isMultiSelect) {
        updateSingleFeatureStyle(newStyle)
      } else {
        applyStyleToSelectedFeatures(newStyle)
      }
      toast({
        title: "Style Applied",
        description: `The style was successfully applied from JSON.`,
      })
    } catch (error) {
      console.error("Invalid style JSON:", error)
      toast({ variant: "destructive", title: "Error", description: "Invalid JSON format." })
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(styleCode)
    toast({ title: "Copied", description: "Style JSON copied to clipboard." })
  }

  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setStyleCode(text)
      toast({ title: "Pasted", description: "Style JSON pasted from clipboard." })
    } catch (error) {
      console.error("Failed to paste from clipboard:", error)
      toast({ variant: "destructive", title: "Error", description: "Could not read from clipboard." })
    }
  }

  return (
    <TooltipProvider>
      <Card className="w-[350px] max-h-[calc(100vh-8rem)] flex flex-col">
        <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            {isMultiSelect ? `${selectedFeatures.length} Features Selected` : "Feature Styling"}
          </CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onDeselectAll} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Deselect All</TooltipContent>
          </Tooltip>
        </CardHeader>
        <div className="overflow-y-auto">
          {isMultiSelect ? (
            <CardContent className="p-4 space-y-4">
              <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1 bg-muted/50">
                {selectedFeatures.map((feature) => {
                  const uid = (window as any).ol.util.getUid(feature)
                  const geomType = feature.getGeometry().getType()
                  return (
                    <div key={uid} className="flex items-center gap-2 p-1 text-sm">
                      <GeomIcon geomType={geomType} />
                      <span>{geomType}</span>
                      <span className="ml-auto text-muted-foreground font-mono text-xs">...{uid.slice(-6)}</span>
                    </div>
                  )
                })}
              </div>
              <div className="space-y-2">
                <Label htmlFor="style-code">Paste Style JSON to Apply</Label>
                <Textarea
                  id="style-code"
                  value={styleCode}
                  onChange={(e) => setStyleCode(e.target.value)}
                  rows={10}
                  className="font-mono text-xs"
                  placeholder="Paste a valid style JSON here..."
                />
                <div className="flex gap-2">
                  <Button onClick={handleApplyCode} className="flex-1">
                    Apply to All
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handlePasteCode}>
                        <ClipboardPaste className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Paste</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardContent>
          ) : (
            // Single selection view
            <CardContent className="p-4 space-y-4">
              {currentStyle.layers.map((layer, index) => (
                <LayerEditor
                  key={layer.id}
                  layer={layer}
                  index={index}
                  totalLayers={currentStyle.layers.length}
                  updateLayerStyle={updateLayerStyle}
                  removeLayer={removeLayer}
                  moveLayer={moveLayer}
                  selectedGeomType={singleFeature.getGeometry().getType()}
                />
              ))}
              <Button onClick={addLayer} variant="outline" className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" /> Add Layer
              </Button>
              {singleFeature.getGeometry().getType() === "LineString" && currentStyle.arrows && (
                <ArrowEditor
                  arrows={currentStyle.arrows}
                  updateArrowStyle={(newArrowStyle) =>
                    updateSingleFeatureStyle({ ...currentStyle, arrows: { ...currentStyle.arrows, ...newArrowStyle } })
                  }
                />
              )}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Style JSON</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <Textarea
                        id="style-code-single"
                        value={styleCode}
                        onChange={(e) => setStyleCode(e.target.value)}
                        rows={10}
                        className="font-mono text-xs"
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleApplyCode} className="flex-1">
                          Apply from JSON
                        </Button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={handleCopyCode}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={handlePasteCode}>
                              <ClipboardPaste className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Paste</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          )}
        </div>
      </Card>
    </TooltipProvider>
  )
}
