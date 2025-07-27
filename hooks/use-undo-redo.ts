"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type UndoRedo from "ol-ext/interaction/UndoRedo.js"

declare global {
  interface Window {
    ol: any
  }
}

interface UseUndoRedoOptions {
  maxLength?: number
  onChange?: (canUndo: boolean, canRedo: boolean) => void
}

interface UseUndoRedoReturn {
  undoRedo: React.MutableRefObject<UndoRedo | null>
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  clearHistory: () => void
  startUndoBlock: () => void
  endUndoBlock: () => void
}

export function useUndoRedo(map: any, vectorSource: any, vectorLayer: any, options: UseUndoRedoOptions = {}): UseUndoRedoReturn {
  const undoRedo = useRef<UndoRedo | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const { maxLength = 50, onChange } = options

  const updateUndoRedoState = useCallback(() => {
    if (undoRedo.current) {
      try {
        // Access the internal stacks directly
        const undoStack = (undoRedo.current as any)._undoStack || []
        const redoStack = (undoRedo.current as any)._redoStack || []
        
        const undoLength = undoStack.length
        const redoLength = redoStack.length
        
        const newCanUndo = undoLength > 0
        const newCanRedo = redoLength > 0
        
        // Only log when state actually changes
        if (newCanUndo !== canUndo || newCanRedo !== canRedo) {
          console.log('Undo/Redo state changed:', { undoLength, redoLength, newCanUndo, newCanRedo })
        }
        
        setCanUndo(newCanUndo)
        setCanRedo(newCanRedo)
        onChange?.(newCanUndo, newCanRedo)
      } catch (error) {
        console.warn('Error updating undo/redo state:', error)
        setCanUndo(false)
        setCanRedo(false)
        onChange?.(false, false)
      }
    }
  }, [onChange, canUndo, canRedo])

  useEffect(() => {
    if (!map || !vectorSource || !vectorLayer || !window.ol) return

    const handleFeatureChange = (event: any) => {
      if (undoRedo.current) {
        // The UndoRedo interaction will automatically track changes
        // We just need to update the UI state
        updateUndoRedoState()
      }
    }

    const loadUndoRedoAsync = async () => {
      try {
        const UndoRedo = (await import("ol-ext/interaction/UndoRedo.js")).default
        
        undoRedo.current = new UndoRedo({
          maxLength
        })

        // Add to map
        map.addInteraction(undoRedo.current)

        // Listen for changes in the undo/redo stack
        undoRedo.current.on("stack:add", updateUndoRedoState)
        undoRedo.current.on("stack:remove", updateUndoRedoState)
        undoRedo.current.on("stack:clear", updateUndoRedoState)

        // Listen for feature changes to track undo/redo
        vectorSource.on("addfeature", handleFeatureChange)
        vectorSource.on("removefeature", handleFeatureChange)
        vectorSource.on("changefeature", handleFeatureChange)

        // Initial state update
        updateUndoRedoState()
        
      } catch (error) {
        console.error("Failed to load UndoRedo interaction:", error)
      }
    }

    loadUndoRedoAsync()

    return () => {
      if (undoRedo.current && map) {
        map.removeInteraction(undoRedo.current)
        undoRedo.current = null
      }
      if (vectorSource) {
        vectorSource.un("addfeature", handleFeatureChange)
        vectorSource.un("removefeature", handleFeatureChange)
        vectorSource.un("changefeature", handleFeatureChange)
      }
    }
  }, [map, vectorSource, vectorLayer, maxLength, updateUndoRedoState])

  const undo = useCallback(() => {
    if (undoRedo.current && canUndo) {
      try {
        undoRedo.current.undo()
        // Trigger a refresh of the vector source
        if (vectorSource) {
          vectorSource.changed()
        }
        // Update state after a brief delay to allow the interaction to complete
        setTimeout(updateUndoRedoState, 100)
      } catch (error) {
        console.warn('Error during undo operation:', error)
      }
    }
  }, [canUndo, vectorSource, updateUndoRedoState])

  const redo = useCallback(() => {
    if (undoRedo.current && canRedo) {
      try {
        undoRedo.current.redo()
        // Trigger a refresh of the vector source
        if (vectorSource) {
          vectorSource.changed()
        }
        // Update state after a brief delay to allow the interaction to complete
        setTimeout(updateUndoRedoState, 100)
      } catch (error) {
        console.warn('Error during redo operation:', error)
      }
    }
  }, [canRedo, vectorSource, updateUndoRedoState])

  const clearHistory = useCallback(() => {
    if (undoRedo.current) {
      undoRedo.current.clear()
      updateUndoRedoState()
    }
  }, [updateUndoRedoState])

  const startUndoBlock = useCallback(() => {
    if (undoRedo.current) {
      try {
        // Use ol-ext's block methods if available
        if (typeof undoRedo.current.blockStart === 'function') {
          undoRedo.current.blockStart()
        }
      } catch (error) {
        console.warn('Error starting undo block:', error)
      }
    }
  }, [])

  const endUndoBlock = useCallback(() => {
    if (undoRedo.current) {
      try {
        // Use ol-ext's block methods if available
        if (typeof undoRedo.current.blockEnd === 'function') {
          undoRedo.current.blockEnd()
        }
      } catch (error) {
        console.warn('Error ending undo block:', error)
      }
    }
  }, [])

  return {
    undoRedo,
    canUndo,
    canRedo,
    undo,
    redo,
    clearHistory,
    startUndoBlock,
    endUndoBlock,
  }
}