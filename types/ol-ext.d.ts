// This file provides type declarations for the ol-ext modules we are using.
// This helps TypeScript and the bundler understand the shape of these modules.

declare module "ol-ext/dist/interaction/Offset.js" {
  import { Interaction } from "ol/interaction"
  import type VectorSource from "ol/source/Vector"

  export interface Options {
    source?: VectorSource
    features?: any
    filter?: (feature: any, layer: any) => boolean
    style?: any
  }

  export default class Offset extends Interaction {
    constructor(options?: Options)
    on(type: "offset:end", listener: (event: any) => void): void
  }
}

declare module "ol-ext/dist/geom/GeomUtils.js" {
  import type { Coordinate } from "ol/coordinate"
  export function ol_coordinate_offsetCoords(coords: Coordinate[], offset: number): Coordinate[]
}

declare module "ol-ext/dist/interaction/Transform.js" {
  import { Interaction } from "ol/interaction"
  import type { Collection } from "ol"
  import type Feature from "ol/Feature"

  export interface Options {
    features?: Collection<Feature>
    layers?: any[]
    filter?: (feature: any, layer: any) => boolean
    enableRotatedTransform?: boolean
    addCondition?: (e: any) => boolean
    hitTolerance?: number
    translateFeature?: boolean
    scale?: boolean
    rotate?: boolean
    keepAspectRatio?: (e: any) => boolean
    translate?: boolean
    stretch?: boolean
    style?: any
  }

  export default class Transform extends Interaction {
    constructor(options?: Options)
  }
}
