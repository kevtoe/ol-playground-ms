"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  FolderPlus,
  Settings,
  ChevronDown,
  ChevronUp,
  Layers,
  Library,
  HelpCircle,
  Trash2,
  AlertCircle
} from "lucide-react"
import { LayerItem } from "@/components/layers/layer-item"
import { LayerGroup } from "@/components/layers/layer-group"
import type { Layer, LayerGroup as LayerGroupType, Preset, FeatureStyle } from "@/lib/types"

interface ConsolidatedLeftPanelProps {
  // Panel state
  isOpen: boolean
  onToggle: () => void
  
  // Layer management props
  layers: (Layer | LayerGroupType)[]
  selectedLayerIds: string[]
  onLayerSelect: (layerIds: string[]) => void
  onLayerUpdate: (id: string, updates: Partial<Layer>) => void
  onLayerDelete: (id: string) => void
  onLayerReorder: (draggedId: string, targetId: string, position: 'before' | 'after' | 'inside') => void
  onGroupCreate: () => void
  onGroupUpdate: (id: string, updates: Partial<LayerGroupType>) => void
  onGroupDelete: (id: string) => void
  onLayerVisibilityToggle: (id: string) => void
  onGroupVisibilityToggle: (id: string) => void
  onMoveToGroup: (layerId: string, groupId?: string) => void
  
  // Presets props
  presets: Preset[]
  onPresetApply: (style: FeatureStyle) => void
  onPresetDelete: (name: string) => void
  presetsDisabled: boolean
  
  // Helper props
  currentMode: string
}

export function ConsolidatedLeftPanel({
  isOpen,
  onToggle,
  layers,
  selectedLayerIds,
  onLayerSelect,
  onLayerUpdate,
  onLayerDelete,
  onLayerReorder,
  onGroupCreate,
  onGroupUpdate,
  onGroupDelete,
  onLayerVisibilityToggle,
  onGroupVisibilityToggle,
  onMoveToGroup,
  presets,
  onPresetApply,
  onPresetDelete,
  presetsDisabled,
  currentMode
}: ConsolidatedLeftPanelProps) {
  const [activeTab, setActiveTab] = useState("layers")
  const [searchQuery, setSearchQuery] = useState("")
  const [allCollapsed, setAllCollapsed] = useState(false)

  // Helper function for getting instruction text
  const getHelperText = () => {
    switch (currentMode) {
      case "select":
        return "Click to select, Shift+Click to multi-select, Shift+Drag to box-select. Drag points to modify."
      case "draw-line":
        return "Click to start drawing a line. Double-click to finish."
      case "draw-polygon":
        return "Click to start drawing a polygon. Double-click to finish."
      case "draw-circle":
        return "Click and drag to draw a circle."
      case "draw-rectangle":
        return "Click and drag to draw a rectangle."
      case "offset":
        return "Click and drag a line to create an offset copy. Click and drag a polygon to transform it."
      case "delete":
        return "Click on a feature to delete it."
      default:
        return "Select a tool to begin."
    }
  }

  // Layer filtering for search
  const filteredLayers = layers.filter(item => {
    if ('name' in item) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return false
  })

  const handleCollapseAll = () => {
    const newCollapsed = !allCollapsed
    setAllCollapsed(newCollapsed)
    
    layers.forEach(item => {
      if ('layerIds' in item) {
        onGroupUpdate(item.id, { collapsed: newCollapsed })
      }
    })
  }

  const renderLayerItem = (item: Layer | LayerGroupType, index: number) => {
    if ('layerIds' in item) {
      const allLayers = layers.filter(l => 'featureId' in l) as Layer[]
      const groupLayers = item.layerIds
        .map(id => allLayers.find(l => l.id === id))
        .filter(Boolean) as Layer[]
      
      return (
        <LayerGroup
          key={item.id}
          group={item}
          layers={groupLayers}
          selectedLayerIds={selectedLayerIds}
          onSelect={onLayerSelect}
          onUpdate={onGroupUpdate}
          onDelete={onGroupDelete}
          onLayerUpdate={onLayerUpdate}
          onLayerDelete={onLayerDelete}
          onVisibilityToggle={onGroupVisibilityToggle}
          onLayerVisibilityToggle={onLayerVisibilityToggle}
          onMoveToGroup={onMoveToGroup}
          onReorder={onLayerReorder}
        />
      )
    } else {
      if (!item.groupId) {
        return (
          <LayerItem
            key={item.id}
            layer={item}
            isSelected={selectedLayerIds.includes(item.id)}
            onSelect={onLayerSelect}
            onUpdate={onLayerUpdate}
            onDelete={onLayerDelete}
            onVisibilityToggle={onLayerVisibilityToggle}
            onMoveToGroup={onMoveToGroup}
            onReorder={onLayerReorder}
          />
        )
      }
      return null
    }
  }

  return (
    <div className={`
      fixed left-0 top-0 h-full bg-card border-r border-border shadow-lg z-30 
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="w-80 h-full flex flex-col">
        {/* Main content with tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          {/* Tab navigation */}
          <div className="p-3 border-b border-border">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="layers" className="flex items-center gap-2 text-xs">
                <Layers className="h-3 w-3" />
                Layers
              </TabsTrigger>
              <TabsTrigger value="presets" className="flex items-center gap-2 text-xs">
                <Library className="h-3 w-3" />
                Presets
              </TabsTrigger>
              <TabsTrigger value="help" className="flex items-center gap-2 text-xs">
                <HelpCircle className="h-3 w-3" />
                Help
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Layers Tab */}
          <TabsContent value="layers" className="flex-1 flex flex-col m-0">
            {/* Layers Header */}
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">Layer Management</h2>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleCollapseAll}
                      >
                        {allCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {allCollapsed ? "Expand All Groups" : "Collapse All Groups"}
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={onGroupCreate}
                      >
                        <FolderPlus className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Create Group</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Layer Settings</TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search layers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 h-8 text-xs"
                />
              </div>
            </div>

            {/* Layer List */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredLayers.length === 0 ? (
                  <div className="text-center text-muted-foreground text-xs py-8">
                    {searchQuery ? "No layers match your search" : "No layers yet"}
                  </div>
                ) : (
                  filteredLayers.map(renderLayerItem)
                )}
              </div>
            </ScrollArea>

            {/* Layers Footer */}
            <div className="p-3 border-t border-border">
              <div className="text-xs text-muted-foreground text-center">
                {layers.filter(item => 'featureId' in item).length} layers
              </div>
            </div>
          </TabsContent>

          {/* Presets Tab */}
          <TabsContent value="presets" className="flex-1 flex flex-col m-0">
            <div className="p-3 border-b border-border">
              <h2 className="text-sm font-semibold">Style Presets</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {presetsDisabled ? "Select features to apply presets" : "Click to apply preset to selected features"}
              </p>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {presets.length === 0 ? (
                  <div className="text-center text-muted-foreground text-xs py-8">
                    No presets available.
                  </div>
                ) : (
                  presets.map((preset) => (
                    <div key={preset.name} className="flex items-center gap-1 group">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left h-8 px-2 text-xs"
                        onClick={() => onPresetApply(preset.style)}
                        disabled={presetsDisabled}
                      >
                        {preset.name}
                      </Button>
                      {preset.isDeletable && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => onPresetDelete(preset.name)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete Preset</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Help Tab */}
          <TabsContent value="help" className="flex-1 flex flex-col m-0">
            <div className="p-3 border-b border-border">
              <h2 className="text-sm font-semibold">Instructions</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Current mode: <span className="font-medium capitalize">{currentMode.replace('-', ' ')}</span>
              </p>
            </div>

            <div className="flex-1 p-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium mb-2">Current Tool</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {getHelperText()}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">General Controls</h3>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div><kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">Esc</kbd> - Return to select mode</div>
                    <div><kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">Shift + Click</kbd> - Multi-select features</div>
                    <div><kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">Shift + Drag</kbd> - Box select features</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Layer Management</h3>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div>• Click layers in the panel to select them on the map</div>
                    <div>• Drag layers to reorder drawing sequence</div>
                    <div>• Use eye icon to show/hide layers</div>
                    <div>• Create groups to organize layers</div>
                    <div>• Drag layers into groups for organization</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-10 top-4 h-8 w-8 bg-card"
        onClick={onToggle}
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>
    </div>
  )
}