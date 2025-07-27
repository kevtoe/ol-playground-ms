"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  ChevronDown,
  ChevronRight,
  Eye, 
  EyeOff, 
  Trash2,
  Edit2,
  Check,
  X,
  Folder,
  FolderOpen,
  GripVertical
} from "lucide-react"
import { LayerItem } from "./layer-item"
import type { Layer, LayerGroup as LayerGroupType } from "@/lib/types"

interface LayerGroupProps {
  group: LayerGroupType
  layers: Layer[]
  selectedLayerIds: string[]
  onSelect: (layerIds: string[], event?: React.MouseEvent) => void
  onUpdate: (id: string, updates: Partial<LayerGroupType>) => void
  onDelete: (id: string) => void
  onLayerUpdate: (id: string, updates: Partial<Layer>) => void
  onLayerDelete: (id: string) => void
  onVisibilityToggle: (id: string) => void
  onLayerVisibilityToggle: (id: string) => void
  onMoveToGroup: (layerId: string, groupId?: string) => void
  onReorder?: (draggedId: string, targetId: string, position: 'before' | 'after' | 'inside') => void
}

export function LayerGroup({
  group,
  layers,
  selectedLayerIds,
  onSelect,
  onUpdate,
  onDelete,
  onLayerUpdate,
  onLayerDelete,
  onVisibilityToggle,
  onLayerVisibilityToggle,
  onMoveToGroup,
  onReorder
}: LayerGroupProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(group.name)
  const [isDragging, setIsDragging] = useState(false)

  const handleToggleCollapsed = () => {
    onUpdate(group.id, { collapsed: !group.collapsed })
  }

  const handleNameSubmit = () => {
    if (editName.trim() && editName !== group.name) {
      onUpdate(group.id, { name: editName.trim() })
    } else {
      setEditName(group.name)
    }
    setIsEditing(false)
  }

  const handleNameCancel = () => {
    setEditName(group.name)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit()
    } else if (e.key === 'Escape') {
      handleNameCancel()
    }
  }

  const handleGroupSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Select all layers in the group
    const groupLayerIds = layers.map(layer => layer.id)
    
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      // Toggle group selection
      const allSelected = groupLayerIds.every(id => selectedLayerIds.includes(id))
      onSelect(allSelected ? [] : groupLayerIds)
    } else {
      // Single select group
      onSelect(groupLayerIds)
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'group',
      groupId: group.id
    }))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))
      if (data.type === 'layer' && data.layerId) {
        // Move layer to this group
        onMoveToGroup(data.layerId, group.id)
      }
    } catch (err) {
      console.error('Error handling group drop:', err)
    }
  }

  const isGroupSelected = layers.length > 0 && layers.every(layer => selectedLayerIds.includes(layer.id))
  const hasSelectedLayers = layers.some(layer => selectedLayerIds.includes(layer.id))

  return (
    <div className="space-y-1">
      {/* Group Header */}
      <div
        className={`
          group relative flex items-center gap-2 p-2 rounded-md cursor-pointer
          transition-colors duration-150
          ${isGroupSelected ? 'bg-primary/10 border border-primary/20' : 
            hasSelectedLayers ? 'bg-primary/5' : 'hover:bg-muted/50'}
          ${isDragging ? 'opacity-50' : ''}
        `}
        onClick={handleGroupSelect}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drag Handle */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>

        {/* Collapse/Expand Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={(e) => {
            e.stopPropagation()
            handleToggleCollapsed()
          }}
        >
          {group.collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>

        {/* Group Icon */}
        {group.collapsed ? (
          <Folder className="h-4 w-4 text-muted-foreground" />
        ) : (
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
        )}

        {/* Group Name */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleNameSubmit}
                className="h-6 text-xs"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={handleNameSubmit}
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={handleNameCancel}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div
              className="text-xs font-medium truncate"
              onDoubleClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
            >
              {group.name} ({layers.length})
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Edit Name */}
          {!isEditing && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditing(true)
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rename Group</TooltipContent>
            </Tooltip>
          )}

          {/* Visibility */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  onVisibilityToggle(group.id)
                }}
              >
                {group.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{group.visible ? "Hide Group" : "Show Group"}</TooltipContent>
          </Tooltip>

          {/* Delete Group */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(group.id)
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete Group</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Group Layers */}
      {!group.collapsed && (
        <div className="space-y-1">
          {layers.length === 0 ? (
            <div className="ml-8 p-2 text-xs text-muted-foreground">
              Drop layers here to group them
            </div>
          ) : (
            layers.map(layer => (
              <LayerItem
                key={layer.id}
                layer={layer}
                isSelected={selectedLayerIds.includes(layer.id)}
                onSelect={onSelect}
                onUpdate={onLayerUpdate}
                onDelete={onLayerDelete}
                onVisibilityToggle={onLayerVisibilityToggle}
                onMoveToGroup={onMoveToGroup}
                onReorder={onReorder}
                isInGroup={true}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}