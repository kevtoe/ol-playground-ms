export type FillPatternConfig = {
  type: "none" | "hatch" | "cross" | "dot" | "circle" | "square"
  color: string
  size: number
  spacing: number
  angle: number
}

export type StyleLayer = {
  id: string
  strokeColor: string
  strokeWidth: number
  strokeOpacity: number
  fillColor: string
  fillOpacity: number
  fillPattern: FillPatternConfig
  offset: number
  dashed: boolean
  dashPattern: number[]
}

export type ArrowConfig = {
  enabled: boolean
  atStart: boolean
  atEnd: boolean
  alongPath: boolean
  color: string
  size: number
  style: "triangle" | "chevron"
  spacing: number
}

export type FeatureStyle = {
  layers: StyleLayer[]
  arrows: ArrowConfig
}

export type Preset = {
  name: string
  style: FeatureStyle
  isDeletable?: boolean
}

export type SimplifiedStyle = {
  strokeColor: string
  strokeWidth: number
  fillColor: string
}

export type ZoomSettings = {
  enabled: boolean
  threshold: number
  automaticColor: boolean
  style: SimplifiedStyle
  defaultZoom: number
}

// Layer Management Types
export type LayerType = 'line' | 'polygon' | 'circle' | 'bezier'

export type Layer = {
  id: string
  name: string
  featureId: string // OpenLayers feature UID
  visible: boolean
  locked: boolean
  order: number
  groupId?: string
  type: LayerType
  style: FeatureStyle
  created: number // timestamp
}

export type LayerGroup = {
  id: string
  name: string
  visible: boolean
  collapsed: boolean
  order: number
  layerIds: string[]
  created: number // timestamp
}

export type LayerOperation = 
  | { type: 'ADD_LAYER'; payload: Layer }
  | { type: 'UPDATE_LAYER'; payload: { id: string; updates: Partial<Layer> } }
  | { type: 'DELETE_LAYER'; payload: string }
  | { type: 'REORDER_LAYERS'; payload: { layers: Layer[] } }
  | { type: 'ADD_GROUP'; payload: LayerGroup }
  | { type: 'UPDATE_GROUP'; payload: { id: string; updates: Partial<LayerGroup> } }
  | { type: 'DELETE_GROUP'; payload: string }
  | { type: 'MOVE_TO_GROUP'; payload: { layerId: string; groupId?: string } }
  | { type: 'TOGGLE_LAYER_VISIBILITY'; payload: string }
  | { type: 'TOGGLE_GROUP_VISIBILITY'; payload: string }
  | { type: 'SET_SELECTED_LAYERS'; payload: string[] }

export type LayerState = {
  layers: Map<string, Layer>
  groups: Map<string, LayerGroup>
  selectedLayerIds: string[]
  nextOrder: number
}
