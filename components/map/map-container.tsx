"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useOpenLayersMap } from "@/hooks/use-openlayers-map"
import { useMapInteractions } from "@/hooks/use-map-interactions"
import { Toolbar } from "@/components/toolbar/toolbar"
import { StylingPanel } from "@/components/styling/styling-panel"
import { LeftPresetsPanel } from "@/components/presets/left-presets-panel"
import { Helper } from "@/components/toolbar/helper"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { Loader, MapIcon, MapPinOffIcon as MapOff, UploadCloud, Library, Settings, EyeOff } from "lucide-react"
import { SettingsDialog } from "@/components/settings/settings-dialog"
import type { FeatureStyle, Preset, ZoomSettings } from "@/lib/types"
import { DEFAULT_POLYGON_STYLE, DEFAULT_LINE_STYLE } from "@/lib/style-manager"
import { Badge } from "@/components/ui/badge"

interface MapContainerProps {
  serverPresets: Preset[]
}

export default function MapContainer({ serverPresets }: MapContainerProps) {
  const { toast } = useToast()
  const featureStyles = useRef<Map<string, FeatureStyle>>(new Map())
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [zoomSettings, setZoomSettings] = useState<ZoomSettings>({
    enabled: true,
    threshold: 2,
    automaticColor: true,
    style: {
      strokeColor: "#0d94e4",
      strokeWidth: 2,
      fillColor: "#8ac5e6",
    },
    defaultZoom: 17,
  })
  const { mapRef, mapInstance, vectorSource, handleSource, baseLayer, scriptsLoaded, Scripts } = useOpenLayersMap(
    featureStyles,
    zoomSettings,
  )

  const [currentMode, setCurrentMode] = useState<string>("select")
  const [selectedFeatures, setSelectedFeatures] = useState<any[]>([])
  const [isMapVisible, setIsMapVisible] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [presets, setPresets] = useState<Preset[]>(serverPresets)
  const [isPresetsPanelOpen, setIsPresetsPanelOpen] = useState(false)
  const [currentZoomInfo, setCurrentZoomInfo] = useState({ zoom: 15, resolution: 0 })

  const updateStyleCode = useCallback((feature: any | null) => {
    // This function is a placeholder for now.
  }, [])

  const { clearSelection: internalClearSelection } = useMapInteractions({
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

  const clearSelection = useCallback(() => {
    if (selectedFeatures.length > 0) {
      const ol = (window as any).ol
      if (ol) {
        selectedFeatures.forEach((f) => f.set("selected", false))
      }
      setSelectedFeatures([])
      if (handleSource.current) {
        handleSource.current.clear()
      }
      if (vectorSource.current) {
        vectorSource.current.changed()
      }
    }
    internalClearSelection()
  }, [selectedFeatures, handleSource, vectorSource, internalClearSelection])

  // Effect for map events like zoom/pan
  useEffect(() => {
    if (!mapInstance.current) return

    const updateZoomInfo = () => {
      const view = mapInstance.current.getView()
      if (view) {
        setCurrentZoomInfo({
          zoom: view.getZoom() || 15,
          resolution: view.getResolution() || 0,
        })
      }
    }

    mapInstance.current.on("moveend", updateZoomInfo)
    updateZoomInfo() // Initial call

    return () => {
      if (mapInstance.current) {
        mapInstance.current.un("moveend", updateZoomInfo)
      }
    }
  }, [mapInstance.current, clearSelection])

  // Add a new useEffect hook to handle clearing selection when the mode changes.
  useEffect(() => {
    if (currentMode !== "select") {
      clearSelection()
    }
  }, [currentMode, clearSelection])

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

  // Effect to handle Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCurrentMode("select")
        clearSelection()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [clearSelection]) // The dependency ensures this effect uses the latest clearSelection function.

  const applyStyleToSelectedFeatures = (newStyle: FeatureStyle, options?: { silent?: boolean }) => {
    if (selectedFeatures.length === 0) {
      if (!options?.silent) {
        toast({
          variant: "destructive",
          title: "No Features Selected",
          description: "Please select one or more features to apply a style.",
        })
      }
      return
    }
    const ol = (window as any).ol
    selectedFeatures.forEach((feature) => {
      const uid = ol.util.getUid(feature)
      // Use a deep copy to prevent features from sharing style objects
      featureStyles.current.set(uid, JSON.parse(JSON.stringify(newStyle)))
    })
    vectorSource.current?.changed()
    if (!options?.silent) {
      toast({
        title: "Style Applied",
        description: `The style was applied to ${selectedFeatures.length} feature(s).`,
      })
    }
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
    const newPreset: Preset = { name, style: JSON.parse(JSON.stringify(style)), isDeletable: true }
    setPresets((prev) => [...prev, newPreset])
    toast({
      title: "Session Preset Saved",
      description: `Preset "${name}" has been saved for this session.`,
    })
  }

  const handleDeletePreset = (name: string) => {
    const presetToDelete = presets.find((p) => p.name === name)
    if (!presetToDelete?.isDeletable) {
      toast({
        variant: "destructive",
        title: "Cannot Delete",
        description: "File-based presets cannot be deleted from the UI.",
      })
      return
    }
    setPresets((prev) => prev.filter((p) => p.name !== name))
    toast({
      title: "Preset Deleted",
      description: `Preset "${name}" has been deleted for this session.`,
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

        <div className="absolute top-4 left-4 z-20 flex flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <Helper currentMode={currentMode} />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsPresetsPanelOpen((prev) => !prev)}
                  disabled={selectedFeatures.length === 0}
                  className="bg-card"
                >
                  <Library className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {selectedFeatures.length === 0 ? "Select a feature to use presets" : "Toggle Presets Panel"}
              </TooltipContent>
            </Tooltip>
          </div>
          {isPresetsPanelOpen && selectedFeatures.length > 0 && (
            <LeftPresetsPanel
              presets={presets}
              onApply={applyStyleToSelectedFeatures}
              onDelete={handleDeletePreset}
              disabled={selectedFeatures.length === 0}
            />
          )}
        </div>

        <Toolbar currentMode={currentMode} setMode={setCurrentMode} clearAll={clearAll} disabled={!scriptsLoaded} />

        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
          <div className="bg-card/80 backdrop-blur-sm text-card-foreground p-2 rounded-md text-xs font-mono shadow-md">
            <div>Zoom: {currentZoomInfo.zoom.toFixed(2)}</div>
            <div>Res: {currentZoomInfo.resolution.toFixed(2)}</div>
          </div>
          {zoomSettings.enabled && currentZoomInfo.resolution > zoomSettings.threshold && (
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-2 cursor-default">
                  <EyeOff className="h-3.5 w-3.5" />
                  Simplified
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" align="start">
                <p>Styles are simplified. Zoom in to see full detail.</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-20">
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsSettingsOpen(true)}
                  disabled={!scriptsLoaded}
                  className="bg-card"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Map Display Settings</TooltipContent>
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

          {selectedFeatures.length > 0 && currentMode === "select" && (
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
        <SettingsDialog
          isOpen={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          settings={zoomSettings}
          onSettingsChange={setZoomSettings}
          currentResolution={currentZoomInfo.resolution}
        />
        <Toaster />
      </div>
    </TooltipProvider>
  )
}
