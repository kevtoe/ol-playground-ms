"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  FolderPlus,
  Settings,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { LayerItem } from "./layer-item"
import { LayerGroup } from "./layer-group"
import type { Layer, LayerGroup as LayerGroupType } from "@/lib/types"

interface LayerManagementPanelProps {
  isOpen: boolean
  onToggle: () => void
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
}

export function LayerManagementPanel({
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
  onMoveToGroup
}: LayerManagementPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [allCollapsed, setAllCollapsed] = useState(false)

  // Filter layers based on search query
  const filteredLayers = layers.filter(item => {
    if ('name' in item) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return false
  })

  const handleCollapseAll = () => {
    const newCollapsed = !allCollapsed
    setAllCollapsed(newCollapsed)
    
    // Update all groups
    layers.forEach(item => {
      if ('layerIds' in item) { // It's a group
        onGroupUpdate(item.id, { collapsed: newCollapsed })
      }
    })
  }

  const renderLayerItem = (item: Layer | LayerGroupType, index: number) => {
    if ('layerIds' in item) {
      // It's a group - need to get the actual layer objects
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
      // It's a layer - only render if not in a group
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
        {/* Header */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Layers</h2>
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

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            {layers.filter(item => 'featureId' in item).length} layers
          </div>
        </div>
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
