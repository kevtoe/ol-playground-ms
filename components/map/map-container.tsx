"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useOpenLayersMap } from "@/hooks/use-openlayers-map"
import { useMapInteractions } from "@/hooks/use-map-interactions"
import { useLayerManager } from "@/hooks/use-layer-manager"
import { Toolbar } from "@/components/toolbar/toolbar"
import { StylingPanel } from "@/components/styling/styling-panel"
import { ConsolidatedLeftPanel } from "@/components/panels/consolidated-left-panel"
import { LayerDragDropProvider } from "@/components/layers/layer-drag-drop"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { Loader, MapIcon, MapPinOffIcon as MapOff, UploadCloud, Settings, EyeOff, Menu } from "lucide-react"
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

  const [currentMode, setCurrentMode] = useState<string>("select")
  const [selectedFeatures, setSelectedFeatures] = useState<any[]>([])
  const [isMapVisible, setIsMapVisible] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [presets, setPresets] = useState<Preset[]>(serverPresets)
  const [currentZoomInfo, setCurrentZoomInfo] = useState({ zoom: 15, resolution: 0 })
  const [currentCenter, setCurrentCenter] = useState({ lat: -30.777457, lon: 121.505639 })
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false)

  // Layer management - initialize first with dummy vectorSource ref
  const layerManager = useLayerManager(useRef<any>(null), featureStyles, selectedFeatures, setSelectedFeatures)

  const { mapRef, mapInstance, vectorSource, handleSource, baseLayer, scriptsLoaded, Scripts } = useOpenLayersMap(
    featureStyles,
    zoomSettings,
    layerManager.layerOrderMapRef,
  )

  // Update layer manager with actual vectorSource once available
  useEffect(() => {
    if (vectorSource.current && layerManager.vectorSourceRef) {
      layerManager.vectorSourceRef.current = vectorSource.current
    }
  }, [vectorSource.current, layerManager.vectorSourceRef])

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
    onFeatureCreate: layerManager.addLayerFromFeature,
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
        const center = view.getCenter()
        setCurrentZoomInfo({
          zoom: view.getZoom() || 15,
          resolution: view.getResolution() || 0,
        })
        if (center) {
          const [lon, lat] = (window as any).ol.proj.toLonLat(center)
          setCurrentCenter({ lat, lon })
        }
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

  // Sync selection from OpenLayers to layer manager (one-way only to prevent loops)
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    // Debounce selection updates to prevent rapid changes
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current)
    }
    
    selectionTimeoutRef.current = setTimeout(() => {
      layerManager.selectLayersFromFeatures(selectedFeatures)
    }, 50) // 50ms debounce
    
    return () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current)
      }
    }
  }, [selectedFeatures])

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
            
            // Add layers for imported features
            features.forEach((feature: any) => {
              layerManager.addLayerFromFeature(feature)
            })
            
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
    
    // Clear all layers
    Array.from(layerManager.state.layers.values()).forEach(layer => {
      layerManager.operations.deleteLayer(layer.id)
    })
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

  // Memoize ordered layers to prevent unnecessary re-renders
  const orderedLayers = useMemo(() => layerManager.getOrderedLayers(), [layerManager.state.layers, layerManager.state.groups])

  return (
    <TooltipProvider>
      <LayerDragDropProvider>
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

        <div className="absolute top-4 left-4 z-20">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsLeftPanelOpen((prev) => !prev)}
                className="bg-card"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Panel</TooltipContent>
          </Tooltip>
        </div>

        {/* Consolidated Left Panel */}
        <ConsolidatedLeftPanel
          isOpen={isLeftPanelOpen}
          onToggle={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
          layers={orderedLayers}
          selectedLayerIds={layerManager.state.selectedLayerIds}
          onLayerSelect={layerManager.selectFeaturesFromLayers}
          onLayerUpdate={layerManager.operations.updateLayer}
          onLayerDelete={(id) => {
            const layer = layerManager.state.layers.get(id)
            if (layer) {
              // Remove from OpenLayers
              const ol = (window as any).ol
              if (ol && vectorSource.current) {
                const feature = vectorSource.current.getFeatures().find((f: any) => 
                  ol.util.getUid(f) === layer.featureId
                )
                if (feature) {
                  vectorSource.current.removeFeature(feature)
                  featureStyles.current.delete(layer.featureId)
                }
              }
              // Remove from layer manager
              layerManager.operations.deleteLayer(id)
            }
          }}
          onLayerReorder={(draggedId, targetId, position) => {
            // Get all layers and reorder them based on drag & drop
            const allLayers = Array.from(layerManager.state.layers.values())
            const draggedLayer = allLayers.find(l => l.id === draggedId)
            const targetLayer = allLayers.find(l => l.id === targetId)
            
            if (!draggedLayer || !targetLayer) return
            
            // Sort layers by current order to get proper sequence
            const sortedLayers = [...allLayers].sort((a, b) => a.order - b.order)
            const draggedIndex = sortedLayers.findIndex(l => l.id === draggedId)
            const targetIndex = sortedLayers.findIndex(l => l.id === targetId)
            
            // Remove dragged layer
            sortedLayers.splice(draggedIndex, 1)
            
            // Calculate insert position
            let insertIndex = targetIndex
            if (position === 'before') {
              insertIndex = targetIndex
            } else if (position === 'after') {
              insertIndex = targetIndex + (draggedIndex < targetIndex ? 0 : 1)
            }
            
            // Insert at new position
            sortedLayers.splice(insertIndex, 0, draggedLayer)
            
            // Update orders with proper sequencing
            sortedLayers.forEach((layer, index) => {
              layer.order = index
            })
            
            layerManager.operations.reorderLayers(sortedLayers)
          }}
          onGroupCreate={() => {
            const groupId = `group-${Date.now()}`
            layerManager.operations.addGroup({
              id: groupId,
              name: `Group ${Array.from(layerManager.state.groups.values()).length + 1}`,
              visible: true,
              collapsed: false,
              order: layerManager.state.nextOrder,
              layerIds: [],
              created: Date.now()
            })
          }}
          onGroupUpdate={layerManager.operations.updateGroup}
          onGroupDelete={layerManager.operations.deleteGroup}
          onLayerVisibilityToggle={layerManager.operations.toggleLayerVisibility}
          onGroupVisibilityToggle={layerManager.operations.toggleGroupVisibility}
          onMoveToGroup={layerManager.operations.moveToGroup}
          presets={presets}
          onPresetApply={applyStyleToSelectedFeatures}
          onPresetDelete={handleDeletePreset}
          presetsDisabled={selectedFeatures.length === 0}
          currentMode={currentMode}
        />

        <Toolbar currentMode={currentMode} setMode={setCurrentMode} clearAll={clearAll} disabled={!scriptsLoaded} />

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-card/80 backdrop-blur-sm text-card-foreground px-3 py-1.5 rounded-full text-xs font-medium shadow-lg border flex items-center gap-2">
            <span className="tabular-nums">Zoom {currentZoomInfo.zoom.toFixed(1)}</span>
            <span className="text-muted-foreground">| {Math.abs(currentCenter.lat).toFixed(2)}°{currentCenter.lat >= 0 ? 'N' : 'S'} {Math.abs(currentCenter.lon).toFixed(2)}°{currentCenter.lon >= 0 ? 'E' : 'W'}</span>
          </div>
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
      </LayerDragDropProvider>
    </TooltipProvider>
  )
}
