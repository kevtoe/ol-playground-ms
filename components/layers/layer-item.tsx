"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Trash2,
  GripVertical,
  Edit2,
  Check,
  X
} from "lucide-react"
import { LayerTypeIcon } from "./layer-type-icon"
import type { Layer } from "@/lib/types"

interface LayerItemProps {
  layer: Layer
  isSelected: boolean
  onSelect: (layerIds: string[]) => void
  onUpdate: (id: string, updates: Partial<Layer>) => void
  onDelete: (id: string) => void
  onVisibilityToggle: (id: string) => void
  onMoveToGroup?: (layerId: string, groupId?: string) => void
  onReorder?: (draggedId: string, targetId: string, position: 'before' | 'after' | 'inside') => void
  isInGroup?: boolean
}

export function LayerItem({
  layer,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onVisibilityToggle,
  onMoveToGroup,
  onReorder,
  isInGroup = false
}: LayerItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(layer.name)
  const [isDragging, setIsDragging] = useState(false)

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (e.shiftKey) {
      // Multi-select (extend selection)
      onSelect(isSelected ? [] : [layer.id])
    } else if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      onSelect(isSelected ? [] : [layer.id])
    } else {
      // Single select
      onSelect([layer.id])
    }
  }

  const handleNameSubmit = () => {
    if (editName.trim() && editName !== layer.name) {
      onUpdate(layer.id, { name: editName.trim() })
    } else {
      setEditName(layer.name)
    }
    setIsEditing(false)
  }

  const handleNameCancel = () => {
    setEditName(layer.name)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit()
    } else if (e.key === 'Escape') {
      handleNameCancel()
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'layer',
      layerId: layer.id,
      sourceGroupId: layer.groupId
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
      if (data.type === 'layer' && data.layerId !== layer.id) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const y = e.clientY - rect.top
        const height = rect.height
        
        let position: 'before' | 'after' | 'inside' = 'after'
        
        if (y < height * 0.33) {
          position = 'before'
        } else if (y > height * 0.67) {
          position = 'after'
        } else {
          // Middle third - move to same group or reorder
          if (onMoveToGroup && layer.groupId !== data.sourceGroupId) {
            onMoveToGroup(data.layerId, layer.groupId)
            return
          }
          position = 'after' // Default to after if same group
        }
        
        if (onReorder) {
          onReorder(data.layerId, layer.id, position)
        }
      }
    } catch (err) {
      console.error('Error handling layer drop:', err)
    }
  }

  return (
    <div
      className={`
        group relative flex items-center gap-2 p-2 rounded-md cursor-pointer
        transition-colors duration-150
        ${isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'}
        ${isDragging ? 'opacity-50' : ''}
        ${isInGroup ? 'ml-4' : ''}
      `}
      onClick={handleSelect}
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

      {/* Layer Type Icon */}
      <LayerTypeIcon type={layer.type} className="h-4 w-4 text-muted-foreground" />

      {/* Layer Name */}
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
            className="text-xs truncate"
            onDoubleClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
          >
            {layer.name}
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
            <TooltipContent>Rename Layer</TooltipContent>
          </Tooltip>
        )}

        {/* Lock/Unlock */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                onUpdate(layer.id, { locked: !layer.locked })
              }}
            >
              {layer.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{layer.locked ? "Unlock Layer" : "Lock Layer"}</TooltipContent>
        </Tooltip>

        {/* Visibility */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                onVisibilityToggle(layer.id)
              }}
            >
              {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{layer.visible ? "Hide Layer" : "Show Layer"}</TooltipContent>
        </Tooltip>

        {/* Delete */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(layer.id)
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete Layer</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}