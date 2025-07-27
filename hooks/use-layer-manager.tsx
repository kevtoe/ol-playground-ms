"use client"

import { useCallback, useReducer, useRef, useEffect } from "react"
import type { Layer, LayerGroup, LayerState, LayerOperation, LayerType, FeatureStyle } from "@/lib/types"
import { DEFAULT_POLYGON_STYLE, DEFAULT_LINE_STYLE } from "@/lib/style-manager"

// Layer state reducer
function layerReducer(state: LayerState, action: LayerOperation): LayerState {
  switch (action.type) {
    case 'ADD_LAYER': {
      const newLayers = new Map(state.layers)
      newLayers.set(action.payload.id, action.payload)
      return {
        ...state,
        layers: newLayers,
        nextOrder: Math.max(state.nextOrder, action.payload.order + 1)
      }
    }
    
    case 'UPDATE_LAYER': {
      const newLayers = new Map(state.layers)
      const existingLayer = newLayers.get(action.payload.id)
      if (existingLayer) {
        newLayers.set(action.payload.id, { ...existingLayer, ...action.payload.updates })
      }
      return { ...state, layers: newLayers }
    }
    
    case 'DELETE_LAYER': {
      const newLayers = new Map(state.layers)
      const newGroups = new Map(state.groups)
      
      // Remove layer from any groups
      const layer = newLayers.get(action.payload)
      if (layer?.groupId) {
        const group = newGroups.get(layer.groupId)
        if (group) {
          newGroups.set(layer.groupId, {
            ...group,
            layerIds: group.layerIds.filter(id => id !== action.payload)
          })
        }
      }
      
      newLayers.delete(action.payload)
      return {
        ...state,
        layers: newLayers,
        groups: newGroups,
        selectedLayerIds: state.selectedLayerIds.filter(id => id !== action.payload)
      }
    }
    
    case 'REORDER_LAYERS': {
      const newLayers = new Map(state.layers)
      action.payload.layers.forEach((layer, index) => {
        newLayers.set(layer.id, { ...layer, order: index })
      })
      return { ...state, layers: newLayers }
    }
    
    case 'ADD_GROUP': {
      const newGroups = new Map(state.groups)
      newGroups.set(action.payload.id, action.payload)
      return { ...state, groups: newGroups }
    }
    
    case 'UPDATE_GROUP': {
      const newGroups = new Map(state.groups)
      const existingGroup = newGroups.get(action.payload.id)
      if (existingGroup) {
        newGroups.set(action.payload.id, { ...existingGroup, ...action.payload.updates })
      }
      return { ...state, groups: newGroups }
    }
    
    case 'DELETE_GROUP': {
      const newGroups = new Map(state.groups)
      const newLayers = new Map(state.layers)
      
      // Remove group reference from layers
      const group = newGroups.get(action.payload)
      if (group) {
        group.layerIds.forEach(layerId => {
          const layer = newLayers.get(layerId)
          if (layer) {
            newLayers.set(layerId, { ...layer, groupId: undefined })
          }
        })
      }
      
      newGroups.delete(action.payload)
      return { ...state, layers: newLayers, groups: newGroups }
    }
    
    case 'MOVE_TO_GROUP': {
      const newLayers = new Map(state.layers)
      const newGroups = new Map(state.groups)
      const layer = newLayers.get(action.payload.layerId)
      
      if (layer) {
        // Remove from old group
        if (layer.groupId) {
          const oldGroup = newGroups.get(layer.groupId)
          if (oldGroup) {
            newGroups.set(layer.groupId, {
              ...oldGroup,
              layerIds: oldGroup.layerIds.filter(id => id !== action.payload.layerId)
            })
          }
        }
        
        // Add to new group
        if (action.payload.groupId) {
          const newGroup = newGroups.get(action.payload.groupId)
          if (newGroup) {
            newGroups.set(action.payload.groupId, {
              ...newGroup,
              layerIds: [...newGroup.layerIds, action.payload.layerId]
            })
          }
        }
        
        // Update layer
        newLayers.set(action.payload.layerId, { ...layer, groupId: action.payload.groupId })
      }
      
      return { ...state, layers: newLayers, groups: newGroups }
    }
    
    case 'TOGGLE_LAYER_VISIBILITY': {
      const newLayers = new Map(state.layers)
      const layer = newLayers.get(action.payload)
      if (layer) {
        newLayers.set(action.payload, { ...layer, visible: !layer.visible })
      }
      return { ...state, layers: newLayers }
    }
    
    case 'TOGGLE_GROUP_VISIBILITY': {
      const newGroups = new Map(state.groups)
      const newLayers = new Map(state.layers)
      const group = newGroups.get(action.payload)
      
      if (group) {
        const newVisible = !group.visible
        newGroups.set(action.payload, { ...group, visible: newVisible })
        
        // Update all layers in group
        group.layerIds.forEach(layerId => {
          const layer = newLayers.get(layerId)
          if (layer) {
            newLayers.set(layerId, { ...layer, visible: newVisible })
          }
        })
      }
      
      return { ...state, layers: newLayers, groups: newGroups }
    }
    
    case 'SET_SELECTED_LAYERS': {
      return { ...state, selectedLayerIds: action.payload }
    }
    
    default:
      return state
  }
}

// Initial state
const initialState: LayerState = {
  layers: new Map(),
  groups: new Map(),
  selectedLayerIds: [],
  nextOrder: 0
}

export function useLayerManager(
  vectorSource: React.MutableRefObject<any>,
  featureStyles: React.MutableRefObject<Map<string, FeatureStyle>>,
  selectedFeatures: any[],
  setSelectedFeatures: (features: any[]) => void
) {
  const [state, dispatch] = useReducer(layerReducer, initialState)
  const initializationRef = useRef(false)
  const layerOrderMapRef = useRef<Map<string, number>>(new Map())
  const vectorSourceRef = useRef(vectorSource.current)

  // Helper function to determine layer type from geometry
  const getLayerType = useCallback((feature: any): LayerType => {
    if (!feature) return 'line'
    
    const geometry = feature.getGeometry()
    if (!geometry) return 'line'
    
    if (feature.get('isSpline')) return 'bezier'
    
    const geomType = geometry.getType()
    switch (geomType) {
      case 'Polygon':
      case 'MultiPolygon':
        return 'polygon'
      case 'Circle':
        return 'circle'
      case 'LineString':
      case 'MultiLineString':
      default:
        return 'line'
    }
  }, [])

  // Helper function to generate layer name
  const generateLayerName = useCallback((type: LayerType, order: number): string => {
    const names = {
      line: 'Line',
      polygon: 'Polygon',
      circle: 'Circle',
      bezier: 'Bezier Curve'
    }
    return `${names[type]} ${order + 1}`
  }, [])

  // Initialize layers from existing features
  useEffect(() => {
    if (!vectorSourceRef.current || initializationRef.current) return

    const ol = (window as any).ol
    if (!ol) return

    const features = vectorSourceRef.current.getFeatures()
    features.forEach((feature: any, index: number) => {
      const featureId = ol.util.getUid(feature)
      const layerType = getLayerType(feature)
      const existingStyle = featureStyles.current.get(featureId) || 
        (layerType === 'polygon' || layerType === 'circle' ? DEFAULT_POLYGON_STYLE : DEFAULT_LINE_STYLE)

      const layer: Layer = {
        id: `layer-${featureId}`,
        name: generateLayerName(layerType, index),
        featureId,
        visible: true,
        locked: false,
        order: index,
        type: layerType,
        style: JSON.parse(JSON.stringify(existingStyle)),
        created: Date.now()
      }

      dispatch({ type: 'ADD_LAYER', payload: layer })
    })

    initializationRef.current = true
  }, [vectorSourceRef, featureStyles, getLayerType, generateLayerName])

  // Add new layer when feature is created
  const addLayerFromFeature = useCallback((feature: any) => {
    const ol = (window as any).ol
    if (!ol) return

    const featureId = ol.util.getUid(feature)
    const layerType = getLayerType(feature)
    const existingStyle = featureStyles.current.get(featureId) || 
      (layerType === 'polygon' || layerType === 'circle' ? DEFAULT_POLYGON_STYLE : DEFAULT_LINE_STYLE)

    const layer: Layer = {
      id: `layer-${featureId}`,
      name: generateLayerName(layerType, state.nextOrder),
      featureId,
      visible: true,
      locked: false,
      order: state.nextOrder,
      type: layerType,
      style: JSON.parse(JSON.stringify(existingStyle)),
      created: Date.now()
    }

    dispatch({ type: 'ADD_LAYER', payload: layer })
  }, [getLayerType, generateLayerName, state.nextOrder])

  // Remove layer when feature is deleted
  const removeLayerFromFeature = useCallback((featureId: string) => {
    const layerId = `layer-${featureId}`
    dispatch({ type: 'DELETE_LAYER', payload: layerId })
  }, [])

  // Get ordered layers (considering groups)
  const getOrderedLayers = useCallback(() => {
    const layers = Array.from(state.layers.values())
    const groups = Array.from(state.groups.values())
    
    // Sort groups by order
    groups.sort((a, b) => a.order - b.order)
    
    // Get layers not in any group
    const ungroupedLayers = layers
      .filter(layer => !layer.groupId)
      .sort((a, b) => a.order - b.order)
    
    const result: (Layer | LayerGroup)[] = []
    
    // Add ungrouped layers first
    result.push(...ungroupedLayers)
    
    // Add groups (LayerGroup component will handle rendering its own layers)
    result.push(...groups)
    
    return result
  }, [state.layers, state.groups])

  // Update layer visibility and sync with OpenLayers
  const updateLayerVisibility = useCallback(() => {
    if (!vectorSourceRef.current) return

    const ol = (window as any).ol
    if (!ol) return

    // Update feature visibility based on layer state
    vectorSourceRef.current.getFeatures().forEach((feature: any) => {
      const featureId = ol.util.getUid(feature)
      const layerId = `layer-${featureId}`
      const layer = state.layers.get(layerId)
      
      if (layer) {
        // Set feature property to control visibility in style function
        feature.set('layerVisible', layer.visible)
      }
    })

    // Trigger style refresh
    vectorSourceRef.current.changed()
  }, [state.layers])

  // Update visibility when layer state changes
  useEffect(() => {
    updateLayerVisibility()
  }, [updateLayerVisibility])

  // Update layer order map whenever layers change
  useEffect(() => {
    const newOrderMap = new Map<string, number>()
    Array.from(state.layers.values()).forEach(layer => {
      newOrderMap.set(layer.id, layer.order)
    })
    layerOrderMapRef.current = newOrderMap
    
    // Trigger style refresh to apply new zIndex
    if (vectorSourceRef.current) {
      vectorSourceRef.current.changed()
    }
  }, [state.layers])

  // Layer operations
  const layerOperations = {
    addLayer: (layer: Layer) => dispatch({ type: 'ADD_LAYER', payload: layer }),
    updateLayer: (id: string, updates: Partial<Layer>) => dispatch({ type: 'UPDATE_LAYER', payload: { id, updates } }),
    deleteLayer: (id: string) => dispatch({ type: 'DELETE_LAYER', payload: id }),
    reorderLayers: (layers: Layer[]) => dispatch({ type: 'REORDER_LAYERS', payload: { layers } }),
    addGroup: (group: LayerGroup) => dispatch({ type: 'ADD_GROUP', payload: group }),
    updateGroup: (id: string, updates: Partial<LayerGroup>) => dispatch({ type: 'UPDATE_GROUP', payload: { id, updates } }),
    deleteGroup: (id: string) => dispatch({ type: 'DELETE_GROUP', payload: id }),
    moveToGroup: (layerId: string, groupId?: string) => dispatch({ type: 'MOVE_TO_GROUP', payload: { layerId, groupId } }),
    toggleLayerVisibility: (id: string) => dispatch({ type: 'TOGGLE_LAYER_VISIBILITY', payload: id }),
    toggleGroupVisibility: (id: string) => dispatch({ type: 'TOGGLE_GROUP_VISIBILITY', payload: id }),
    setSelectedLayers: (layerIds: string[]) => dispatch({ type: 'SET_SELECTED_LAYERS', payload: layerIds }),
  }

  // Selection synchronization
  const selectLayersFromFeatures = useCallback((features: any[]) => {
    try {
      const ol = (window as any).ol
      if (!ol) return

      const layerIds = features.map(feature => `layer-${ol.util.getUid(feature)}`)
      dispatch({ type: 'SET_SELECTED_LAYERS', payload: layerIds })
    } catch (error) {
      console.error('Error in selectLayersFromFeatures:', error)
    }
  }, [])

  const selectFeaturesFromLayers = useCallback((layerIds: string[]) => {
    try {
      if (!vectorSourceRef.current) return

      const ol = (window as any).ol
      if (!ol) return

      const features = layerIds
        .map(layerId => {
          const layer = state.layers.get(layerId)
          if (!layer) return null
          return vectorSourceRef.current.getFeatures().find((f: any) => ol.util.getUid(f) === layer.featureId)
        })
        .filter(Boolean)

      // Update selected layers in layer state
      dispatch({ type: 'SET_SELECTED_LAYERS', payload: layerIds })
      
      // Update selected features in OpenLayers
      setSelectedFeatures(features)
      
      // Also make sure the features are marked as selected for styling
      // First clear all selections
      vectorSourceRef.current.getFeatures().forEach((f: any) => {
        f.set('selected', false)
      })
      
      // Then mark the selected features
      features.forEach((f: any) => {
        f.set('selected', true)
      })
      
      // Trigger style refresh
      vectorSourceRef.current.changed()
    } catch (error) {
      console.error('Error in selectFeaturesFromLayers:', error)
    }
  }, [state.layers, setSelectedFeatures])

  return {
    state,
    operations: layerOperations,
    getOrderedLayers,
    addLayerFromFeature,
    removeLayerFromFeature,
    selectLayersFromFeatures,
    selectFeaturesFromLayers,
    layerOrderMapRef,
    vectorSourceRef
  }
}