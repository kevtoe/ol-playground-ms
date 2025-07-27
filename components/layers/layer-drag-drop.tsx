"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import type { Layer, LayerGroup } from "@/lib/types"

interface DragDropContextType {
  draggedItem: DraggedItem | null
  setDraggedItem: (item: DraggedItem | null) => void
  dragOverTarget: string | null
  setDragOverTarget: (target: string | null) => void
  dropPosition: 'before' | 'after' | 'inside' | null
  setDropPosition: (position: 'before' | 'after' | 'inside' | null) => void
}

interface DraggedItem {
  type: 'layer' | 'group'
  id: string
  data: Layer | LayerGroup
}

const DragDropContext = createContext<DragDropContextType | null>(null)

export function LayerDragDropProvider({ children }: { children: ReactNode }) {
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null)
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null)

  return (
    <DragDropContext.Provider value={{
      draggedItem,
      setDraggedItem,
      dragOverTarget,
      setDragOverTarget,
      dropPosition,
      setDropPosition
    }}>
      {children}
    </DragDropContext.Provider>
  )
}

export function useDragDrop() {
  const context = useContext(DragDropContext)
  if (!context) {
    throw new Error('useDragDrop must be used within LayerDragDropProvider')
  }
  return context
}

export interface DragDropHandlers {
  onDragStart: (e: React.DragEvent, item: Layer | LayerGroup, type: 'layer' | 'group') => void
  onDragEnd: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent, targetId: string, allowDrop?: boolean) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (
    e: React.DragEvent,
    targetId: string,
    onReorder: (draggedId: string, targetId: string, position: 'before' | 'after' | 'inside') => void
  ) => void
}

export function useDragDropHandlers(): DragDropHandlers {
  const {
    draggedItem,
    setDraggedItem,
    dragOverTarget,
    setDragOverTarget,
    dropPosition,
    setDropPosition
  } = useDragDrop()

  const onDragStart = (e: React.DragEvent, item: Layer | LayerGroup, type: 'layer' | 'group') => {
    const dragData = { type, id: item.id, data: item }
    setDraggedItem(dragData)
    
    // Set drag data for external drops
    e.dataTransfer.setData('application/json', JSON.stringify(dragData))
    e.dataTransfer.effectAllowed = 'move'
    
    // Add drag image styling
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement
    dragImage.style.transform = 'rotate(-5deg)'
    dragImage.style.opacity = '0.8'
    e.dataTransfer.setDragImage(dragImage, 0, 0)
  }

  const onDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null)
    setDragOverTarget(null)
    setDropPosition(null)
  }

  const onDragOver = (e: React.DragEvent, targetId: string, allowDrop = true) => {
    if (!allowDrop || !draggedItem || draggedItem.id === targetId) {
      return
    }
    
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    // Calculate drop position based on mouse position
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const y = e.clientY - rect.top
    const height = rect.height
    
    let position: 'before' | 'after' | 'inside' = 'after'
    
    if (y < height * 0.25) {
      position = 'before'
    } else if (y > height * 0.75) {
      position = 'after'
    } else {
      // Check if target can accept drops inside (groups can)
      position = 'inside'
    }
    
    setDragOverTarget(targetId)
    setDropPosition(position)
  }

  const onDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the element (not entering a child)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverTarget(null)
      setDropPosition(null)
    }
  }

  const onDrop = (
    e: React.DragEvent,
    targetId: string,
    onReorder: (draggedId: string, targetId: string, position: 'before' | 'after' | 'inside') => void
  ) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!draggedItem || !dropPosition || draggedItem.id === targetId) {
      return
    }
    
    onReorder(draggedItem.id, targetId, dropPosition)
    
    // Clear drag state
    setDraggedItem(null)
    setDragOverTarget(null)
    setDropPosition(null)
  }

  return {
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop
  }
}

// Drop indicator component
export function DropIndicator({ 
  isActive, 
  position 
}: { 
  isActive: boolean
  position: 'before' | 'after' | 'inside' | null 
}) {
  if (!isActive || !position) return null

  const baseClasses = "absolute left-0 right-0 h-0.5 bg-primary z-50 pointer-events-none"
  const positionClasses = {
    before: "-top-px",
    after: "-bottom-px", 
    inside: "top-0 bottom-0 h-auto bg-primary/10 border-2 border-primary border-dashed rounded"
  }

  return (
    <div className={`${baseClasses} ${positionClasses[position]}`}>
      {position === 'inside' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-primary bg-background px-2 py-1 rounded">
            Drop to group
          </span>
        </div>
      )}
    </div>
  )
}