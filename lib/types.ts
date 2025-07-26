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
