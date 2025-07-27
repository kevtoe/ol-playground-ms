import type React from "react"
import type { FeatureStyle, StyleLayer, ZoomSettings } from "./types"

const hexToRgba = (hex: string, opacity: number) => {
  if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) return `rgba(0,0,0,${opacity})`
  let c = hex.substring(1).split("")
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]]
  }
  const i = Number.parseInt(`0x${c.join("")}`)
  return `rgba(${(i >> 16) & 255}, ${(i >> 8) & 255}, ${i & 255}, ${opacity})`
}

export const DEFAULT_POLYGON_STYLE: FeatureStyle = {
  layers: [
    {
      id: "layer1",
      strokeColor: "#0000ff",
      strokeWidth: 2,
      strokeOpacity: 1,
      fillColor: "#0000ff",
      fillOpacity: 0.5,
      fillPattern: {
        type: "none",
        color: "#000000",
        size: 3,
        spacing: 8,
        angle: 0,
      },
      offset: 0,
    },
  ],
  arrows: {
    enabled: false,
    atStart: false,
    atEnd: false,
    alongPath: false,
    color: "#ff0000",
    size: 12,
    style: "triangle",
    spacing: 150,
  },
}

export const DEFAULT_LINE_STYLE: FeatureStyle = {
  layers: [
    {
      id: `layer${Date.now()}`,
      strokeColor: "#0000ff",
      strokeWidth: 5,
      strokeOpacity: 1,
      fillColor: "#0000ff",
      fillOpacity: 0.4,
      fillPattern: { type: "none", color: "#000000", size: 1, spacing: 5, angle: 0 },
      offset: 0,
    },
  ],
  arrows: {
    enabled: false,
    atStart: false,
    atEnd: true,
    alongPath: false,
    color: "#ff0000",
    size: 12,
    style: "triangle",
    spacing: 150,
  },
}

export function createStyleFunction(
  featureStyles: React.MutableRefObject<Map<string, FeatureStyle>>,
  zoomSettings: ZoomSettings,
) {
  const simplifiedStyleCache = new Map<string, any[]>()
  let simplifiedGlobalStyle: any[] | null = null
  let lastGlobalSettings = ""

  return function styleFunction(feature: any, resolution: number) {
    const ol = (window as any).ol
    if (!ol) return []

    let geometry = feature.getGeometry()
    if (!geometry) return []
    
    // Handle spline features - generate smooth curve from control points
    const isSpline = feature.get('isSpline')
    if (isSpline && geometry.getType() === 'LineString') {
      const splineOptions = feature.get('splineOptions') || {
        tension: 0.5,
        pointsPerSeg: 10,
        normalize: false
      }
      
      // Generate smooth curve using cspline if available
      if (geometry.cspline) {
        geometry = geometry.cspline(splineOptions)
      }
    }
    
    const geomType = geometry.getType()
    const uid = ol.util.getUid(feature)

    // --- Strategy 3: Style Simplification ---
    if (zoomSettings.enabled && resolution > zoomSettings.threshold) {
      // Automatic color based on feature's own style
      if (zoomSettings.automaticColor) {
        const defaultStyle =
          geomType === "Polygon" || geomType === "Circle" ? DEFAULT_POLYGON_STYLE : DEFAULT_LINE_STYLE
        const featureStyle = featureStyles.current.get(uid) || JSON.parse(JSON.stringify(defaultStyle))
        const firstLayer = featureStyle.layers[0]

        if (!firstLayer) return []

        const strokeColor = hexToRgba(firstLayer.strokeColor, firstLayer.strokeOpacity)
        const fillColor = hexToRgba(firstLayer.fillColor, firstLayer.fillOpacity)
        const cacheKey = `${strokeColor}-${fillColor}-${zoomSettings.style.strokeWidth}`

        if (simplifiedStyleCache.has(cacheKey)) {
          return simplifiedStyleCache.get(cacheKey)
        }

        const style = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: strokeColor,
            width: zoomSettings.style.strokeWidth,
          }),
          fill: geomType === "Polygon" || geomType === "Circle" ? new ol.style.Fill({ color: fillColor }) : undefined,
        })

        const styles = [style]
        simplifiedStyleCache.set(cacheKey, styles)
        return styles
      }
      // Global override color
      else {
        const currentGlobalSettings = JSON.stringify(zoomSettings.style)
        if (currentGlobalSettings !== lastGlobalSettings || !simplifiedGlobalStyle) {
          const style = new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: zoomSettings.style.strokeColor,
              width: zoomSettings.style.strokeWidth,
            }),
            fill:
              geomType === "Polygon" || geomType === "Circle"
                ? new ol.style.Fill({ color: zoomSettings.style.fillColor })
                : undefined,
          })
          simplifiedGlobalStyle = [style]
          lastGlobalSettings = currentGlobalSettings
        }
        return simplifiedGlobalStyle
      }
    }

    // --- Existing Detailed Style Logic ---
    const featureStyle =
      featureStyles.current.get(uid) ||
      JSON.parse(
        JSON.stringify(geomType === "Polygon" || geomType === "Circle" ? DEFAULT_POLYGON_STYLE : DEFAULT_LINE_STYLE),
      )
    const styles: any[] = []

    const isSelected = feature.get("selected")
    const isHovered = feature.get("hovered")

    const maxWidth = Math.max(1, ...featureStyle.layers.map((l: StyleLayer) => l.strokeWidth))
    
    // Show vertex points for selected features
    if (isSelected) {
      const originalGeometry = feature.getGeometry()
      let vertexCoords: number[][] = []
      
      if (isSpline) {
        // For spline features, show control points (red)
        vertexCoords = originalGeometry.getCoordinates()
        vertexCoords.forEach((coord: number[]) => {
          styles.push(
            new ol.style.Style({
              geometry: new ol.geom.Point(coord),
              image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({ color: 'rgba(255, 0, 0, 0.8)' }),
                stroke: new ol.style.Stroke({ color: 'white', width: 2 })
              }),
              zIndex: 1000
            })
          )
        })
      } else {
        // For regular geometries, show vertex points (orange)
        if (geomType === 'LineString') {
          vertexCoords = geometry.getCoordinates()
        } else if (geomType === 'Polygon') {
          // Get coordinates from the exterior ring
          vertexCoords = geometry.getCoordinates()[0]
        } else if (geomType === 'Circle') {
          // For circles, show center point
          const center = geometry.getCenter()
          vertexCoords = [center]
        }
        
        // Add vertex point visualization
        if (vertexCoords.length > 0) {
          styles.push(
            new ol.style.Style({
              geometry: new ol.geom.MultiPoint(vertexCoords),
              image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({ color: 'orange' }),
                stroke: new ol.style.Stroke({ color: 'white', width: 2 })
              }),
              zIndex: 1000
            })
          )
        }
      }
    }

    if (isSelected) {
      styles.push(
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: "rgba(255, 165, 0, 0.8)",
            width: maxWidth + 8,
          }),
          fill:
            geomType === "Polygon" || geomType === "Circle"
              ? new ol.style.Fill({ color: "rgba(255, 165, 0, 0.2)" })
              : undefined,
          zIndex: 0,
        }),
      )
    }

    if (isHovered && !isSelected) {
      styles.push(
        new ol.style.Style({
          stroke: new ol.style.Stroke({ color: "rgba(255, 193, 7, 0.6)", width: maxWidth + 6 }),
          zIndex: 0,
        }),
      )
    }

    featureStyle.layers.forEach((layer: StyleLayer, index: number) => {
      let layerGeom = geometry
      if (layer.offset !== 0 && geomType === "LineString" && ol.coordinate.offsetCoords) {
        const offsetInMapUnits = layer.offset * resolution
        layerGeom = new ol.geom.LineString(ol.coordinate.offsetCoords(geometry.getCoordinates(), offsetInMapUnits))
      }

      const stroke = new ol.style.Stroke({
        color: hexToRgba(layer.strokeColor, layer.strokeOpacity),
        width: layer.strokeWidth,
      })

      let fill
      if (geomType === "Polygon" || geomType === "Circle") {
        const patternConfig = layer.fillPattern
        if (patternConfig && patternConfig.type !== "none" && ol.style.FillPattern) {
          fill = new ol.style.FillPattern({
            pattern: patternConfig.type,
            color: patternConfig.color,
            size: patternConfig.size,
            spacing: patternConfig.spacing,
            angle: patternConfig.angle,
            fill: new ol.style.Fill({ color: hexToRgba(layer.fillColor, layer.fillOpacity) }),
          })
        } else {
          fill = new ol.style.Fill({ color: hexToRgba(layer.fillColor, layer.fillOpacity) })
        }
      }

      styles.push(new ol.style.Style({ geometry: layerGeom, stroke, fill, zIndex: index + 10 }))
    })

    if (featureStyle.arrows.enabled && geomType === "LineString") {
      const arrows = featureStyle.arrows
      const coordinates = geometry.getCoordinates()

      const createArrowStyle = (rotation: number) => {
        let svg
        if (arrows.style === "chevron") {
          svg = `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 2.5l5 7.5-5 7.5" stroke="${arrows.color}" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        } else {
          svg = `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 2.5l15 7.5-15 7.5v-15z" fill="${arrows.color}"/></svg>`
        }

        return new ol.style.Style({
          image: new ol.style.Icon({
            src: "data:image/svg+xml;utf8," + encodeURIComponent(svg),
            anchor: [0.5, 0.5],
            rotateWithView: true,
            rotation: -rotation,
            scale: arrows.size / 20,
          }),
          zIndex: 100,
        })
      }

      if (arrows.atEnd && coordinates.length >= 2) {
        const p1 = coordinates[coordinates.length - 2]
        const p2 = coordinates[coordinates.length - 1]
        const rotation = Math.atan2(p2[1] - p1[1], p2[0] - p1[0])
        const arrowStyle = createArrowStyle(rotation)
        styles.push(
          new ol.style.Style({
            geometry: new ol.geom.Point(p2),
            image: arrowStyle.getImage(),
            zIndex: arrowStyle.getZIndex(),
          }),
        )
      }

      if (arrows.atStart && coordinates.length >= 2) {
        const p1 = coordinates[0] // The start point
        const p2 = coordinates[1] // The second point
        const rotation = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) // Correct: rotation from start to second point
        const arrowStyle = createArrowStyle(rotation)
        styles.push(
          new ol.style.Style({
            geometry: new ol.geom.Point(p1), // Place arrow at the start point
            image: arrowStyle.getImage(),
            zIndex: arrowStyle.getZIndex(),
          }),
        )
      }

      if (arrows.alongPath) {
        let accumulatedLength = 0
        const arrowSpacing = arrows.spacing * resolution
        let nextArrowDist = arrowSpacing / 2

        geometry.forEachSegment((start: number[], end: number[]) => {
          const segmentDx = end[0] - start[0]
          const segmentDy = end[1] - start[1]
          const segmentLength = Math.sqrt(segmentDx * segmentDx + segmentDy * segmentDy)

          while (nextArrowDist <= accumulatedLength + segmentLength) {
            const distanceIntoSegment = nextArrowDist - accumulatedLength
            const ratio = distanceIntoSegment / segmentLength
            const point = [start[0] + segmentDx * ratio, start[1] + segmentDy * ratio]
            const rotation = Math.atan2(segmentDy, segmentDx)
            const arrowStyle = createArrowStyle(rotation)
            styles.push(
              new ol.style.Style({
                geometry: new ol.geom.Point(point),
                image: arrowStyle.getImage(),
                zIndex: arrowStyle.getZIndex(),
              }),
            )
            nextArrowDist += arrowSpacing
          }
          accumulatedLength += segmentLength
        })
      }
    }

    return styles
  }
}
