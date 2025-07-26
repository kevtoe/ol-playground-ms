"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useOpenLayersMap } from "@/hooks/use-openlayers-map"
import { useMapInteractions } from "@/hooks/use-map-interactions"
import { Toolbar } from "./toolbar"
import { StylingPanel } from "./styling-panel"
import { PresetsPanel } from "./presets-panel"
import { Helper } from "./helper"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { Loader, MapIcon, MapPinOffIcon as MapOff, UploadCloud, Library } from "lucide-react"
import type { FeatureStyle, Preset } from "@/lib/types"
import { DEFAULT_POLYGON_STYLE, DEFAULT_LINE_STYLE } from "@/lib/style-manager"

export default function MapContainer() {
  const { toast } = useToast()
  const featureStyles = useRef<Map<string, FeatureStyle>>(new Map())
  const { mapRef, mapInstance, vectorSource, handleSource, baseLayer, scriptsLoaded, Scripts } =
    useOpenLayersMap(featureStyles)

  const [currentMode, setCurrentMode] = useState<string>("select")
  const [selectedFeatures, setSelectedFeatures] = useState<any[]>([])
  const [isMapVisible, setIsMapVisible] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [presets, setPresets] = useState<Preset[]>([])
  const [isPresetsPanelOpen, setIsPresetsPanelOpen] = useState(false)

  const updateStyleCode = useCallback((feature: any | null) => {
    // This function is a placeholder for now.
  }, [])

  const { clearSelection } = useMapInteractions({
    map: mapInstance.current,
    vectorSource,
    handleSource,
    mode: currentMode,
    scriptsLoaded,
    selectedFeatures,
    setSelectedFeatures,
    featureStyles,
    updateStyleCode,
  })

  // Effect for Drag and Drop functionality
  useEffect(() => {
    const mapDiv = mapRef.current
    if (!mapDiv || !scriptsLoaded) return

    const ol = (window as any).ol
    const geojsonFormat = new ol.format.GeoJSON()

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = e.dataTransfer?.files
      if (!files || files.length === 0) return

      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const text = event.target?.result
            const features = geojsonFormat.readFeatures(text, {
              dataProjection: "EPSG:4326", // Standard for GeoJSON
              featureProjection: "EPSG:3857", // Map's projection
            })

            if (features.length === 0) {
              throw new Error("No features found in GeoJSON file.")
            }

            // Assign default styles to new features
            features.forEach((feature: any) => {
              const uid = ol.util.getUid(feature)
              const geomType = feature.getGeometry().getType()
              const defaultStyle =
                geomType === "Polygon" || geomType === "MultiPolygon" || geomType === "Circle"
                  ? DEFAULT_POLYGON_STYLE
                  : DEFAULT_LINE_STYLE
              featureStyles.current.set(uid, JSON.parse(JSON.stringify(defaultStyle)))
            })

            vectorSource.current.addFeatures(features)
            mapInstance.current.getView().fit(vectorSource.current.getExtent(), {
              padding: [50, 50, 50, 50],
              duration: 1000,
            })
            toast({
              title: "Import Successful",
              description: `${features.length} features loaded from ${file.name}.`,
            })
          } catch (err) {
            console.error("Error reading GeoJSON file:", err)
            toast({
              variant: "destructive",
              title: "Import Error",
              description: `Could not read features from ${file.name}. Make sure it's a valid GeoJSON file.`,
            })
          }
        }
        reader.readAsText(file)
      })
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(true)
    }
    const handleDragLeave = () => setIsDragging(false)

    mapDiv.addEventListener("dragover", handleDragOver)
    mapDiv.addEventListener("dragleave", handleDragLeave)
    mapDiv.addEventListener("drop", handleDrop)

    return () => {
      mapDiv.removeEventListener("dragover", handleDragOver)
      mapDiv.removeEventListener("dragleave", handleDragLeave)
      mapDiv.removeEventListener("drop", handleDrop)
    }
  }, [scriptsLoaded, toast, mapInstance, vectorSource])

  useEffect(() => {
    if (baseLayer.current) {
      baseLayer.current.setVisible(isMapVisible)
    }
  }, [isMapVisible, scriptsLoaded, baseLayer])

  const applyStyleToSelectedFeatures = (newStyle: FeatureStyle) => {
    if (selectedFeatures.length === 0) {
      toast({
        variant: "destructive",
        title: "No Features Selected",
        description: "Please select one or more features to apply a style.",
      })
      return
    }
    const ol = (window as any).ol
    selectedFeatures.forEach((feature) => {
      const uid = ol.util.getUid(feature)
      // Use a deep copy to prevent features from sharing style objects
      featureStyles.current.set(uid, JSON.parse(JSON.stringify(newStyle)))
    })
    vectorSource.current?.changed()
    toast({
      title: "Style Applied",
      description: `The style was applied to ${selectedFeatures.length} feature(s).`,
    })
  }

  const clearAll = () => {
    vectorSource.current?.clear()
    handleSource.current?.clear()
    featureStyles.current.clear()
    setSelectedFeatures([])
  }

  const handleSavePreset = (name: string, style: FeatureStyle) => {
    if (presets.some((p) => p.name === name)) {
      toast({
        variant: "destructive",
        title: "Preset Exists",
        description: `A preset with the name "${name}" already exists.`,
      })
      return
    }
    const newPreset: Preset = { name, style: JSON.parse(JSON.stringify(style)) }
    setPresets((prev) => [...prev, newPreset])
    toast({
      title: "Preset Saved",
      description: `Preset "${name}" has been saved.`,
    })
  }

  const handleDeletePreset = (name: string) => {
    setPresets((prev) => prev.filter((p) => p.name !== name))
    toast({
      title: "Preset Deleted",
      description: `Preset "${name}" has been deleted.`,
    })
  }

  return (
    <TooltipProvider>
      <Scripts />
      <div className="w-full h-full relative">
        <div ref={mapRef} className="w-full h-full bg-black" />
        {!scriptsLoaded && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-lg">
              <Loader className="h-6 w-6 animate-spin" />
              <span>Loading Map...</span>
            </div>
          </div>
        )}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/20 border-4 border-dashed border-primary flex items-center justify-center z-30 pointer-events-none">
            <div className="text-center bg-card p-4 rounded-lg shadow-lg">
              <UploadCloud className="h-12 w-12 mx-auto text-primary" />
              <p className="mt-2 text-lg font-semibold">Drop GeoJSON file here</p>
            </div>
          </div>
        )}

        <Helper currentMode={currentMode} />

        <Toolbar currentMode={currentMode} setMode={setCurrentMode} clearAll={clearAll} disabled={!scriptsLoaded} />

        <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-20">
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsPresetsPanelOpen(true)}
                  disabled={!scriptsLoaded}
                  className="bg-card"
                >
                  <Library className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Style Presets</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsMapVisible(!isMapVisible)}
                  disabled={!scriptsLoaded}
                  className="bg-card"
                >
                  {isMapVisible ? <MapIcon className="h-4 w-4" /> : <MapOff className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isMapVisible ? "Hide Basemap" : "Show Basemap"}</TooltipContent>
            </Tooltip>
          </div>

          {selectedFeatures.length > 0 && (
            <StylingPanel
              key={selectedFeatures.map((f) => (window as any).ol.util.getUid(f)).join("-")}
              selectedFeatures={selectedFeatures}
              featureStylesRef={featureStyles}
              applyStyleToSelectedFeatures={applyStyleToSelectedFeatures}
              onDeselectAll={clearSelection}
              onSavePreset={handleSavePreset}
            />
          )}
        </div>
        <PresetsPanel
          isOpen={isPresetsPanelOpen}
          onOpenChange={setIsPresetsPanelOpen}
          presets={presets}
          onApply={applyStyleToSelectedFeatures}
          onDelete={handleDeletePreset}
          disabled={selectedFeatures.length === 0}
        />
        <Toaster />
      </div>
    </TooltipProvider>
  )
}
