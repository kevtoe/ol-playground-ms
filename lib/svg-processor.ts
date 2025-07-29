import { Feature } from 'ol'
import { Vector as VectorSource } from 'ol/source'
import { Geometry, LineString, Polygon, Point } from 'ol/geom'
import GeoJSON from 'ol/format/GeoJSON'
import { transform } from 'ol/proj'

export interface SVGGeometry {
  type: 'path' | 'circle' | 'rect' | 'line' | 'polygon'
  geometry: Geometry
  style: {
    fill?: string
    stroke?: string
    strokeWidth?: number
    fillOpacity?: number
    strokeOpacity?: number
  }
  id: string
}

export class SVGProcessor {
  private svgBounds: { minX: number; minY: number; maxX: number; maxY: number }

  constructor() {
    this.svgBounds = { minX: 0, minY: 0, maxX: 100, maxY: 100 }
  }

  /**
   * Parse SVG content and extract geometries
   */
  parseSVG(svgContent: string): SVGGeometry[] {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgContent, 'image/svg+xml')
    
    // Get SVG dimensions
    const svgElement = doc.documentElement
    const viewBox = svgElement.getAttribute('viewBox')
    if (viewBox) {
      const [minX, minY, width, height] = viewBox.split(' ').map(Number)
      this.svgBounds = { minX, minY, maxX: minX + width, maxY: minY + height }
    } else {
      const width = parseFloat(svgElement.getAttribute('width') || '100')
      const height = parseFloat(svgElement.getAttribute('height') || '100')
      this.svgBounds = { minX: 0, minY: 0, maxX: width, maxY: height }
    }

    const geometries: SVGGeometry[] = []
    
    // Process paths
    const paths = doc.querySelectorAll('path')
    paths.forEach((path, index) => {
      const geometry = this.parsePath(path.getAttribute('d') || '')
      if (geometry) {
        geometries.push({
          type: 'path',
          geometry,
          style: this.extractStyle(path),
          id: `path_${index}`
        })
      }
    })

    // Process circles
    const circles = doc.querySelectorAll('circle')
    circles.forEach((circle, index) => {
      const geometry = this.parseCircle(circle)
      if (geometry) {
        geometries.push({
          type: 'circle',
          geometry,
          style: this.extractStyle(circle),
          id: `circle_${index}`
        })
      }
    })

    // Process ellipses
    const ellipses = doc.querySelectorAll('ellipse')
    ellipses.forEach((ellipse, index) => {
      const geometry = this.parseEllipse(ellipse)
      if (geometry) {
        geometries.push({
          type: 'circle', // Treat as circle for now
          geometry,
          style: this.extractStyle(ellipse),
          id: `ellipse_${index}`
        })
      }
    })

    // Process rectangles
    const rects = doc.querySelectorAll('rect')
    rects.forEach((rect, index) => {
      const geometry = this.parseRect(rect)
      if (geometry) {
        geometries.push({
          type: 'rect',
          geometry,
          style: this.extractStyle(rect),
          id: `rect_${index}`
        })
      }
    })

    // Process lines
    const lines = doc.querySelectorAll('line')
    lines.forEach((line, index) => {
      const geometry = this.parseLine(line)
      if (geometry) {
        geometries.push({
          type: 'line',
          geometry,
          style: this.extractStyle(line),
          id: `line_${index}`
        })
      }
    })

    // Process polygons
    const polygons = doc.querySelectorAll('polygon')
    polygons.forEach((polygon, index) => {
      const geometry = this.parsePolygon(polygon)
      if (geometry) {
        geometries.push({
          type: 'polygon',
          geometry,
          style: this.extractStyle(polygon),
          id: `polygon_${index}`
        })
      }
    })

    return geometries
  }

  /**
   * Convert SVG coordinates to OpenLayers coordinates (EPSG:3857)
   */
  private svgToMapCoords(x: number, y: number): [number, number] {
    const svgWidth = this.svgBounds.maxX - this.svgBounds.minX
    const svgHeight = this.svgBounds.maxY - this.svgBounds.minY
    
    // Normalize to 0-1 range
    const normX = (x - this.svgBounds.minX) / svgWidth
    const normY = (y - this.svgBounds.minY) / svgHeight
    
    // Map to a reasonable geographic area (Australia region)
    // Using real Web Mercator coordinates
    const centerLon = 121.505639 // Center of Australia region
    const centerLat = -30.777457
    const scale = 0.01 // degrees
    
    const mapLon = centerLon + (normX - 0.5) * scale
    const mapLat = centerLat + (0.5 - normY) * scale // SVG Y is inverted
    
    // Convert to Web Mercator (EPSG:3857)
    const mercatorX = mapLon * 20037508.34 / 180
    const mercatorY = Math.log(Math.tan((90 + mapLat) * Math.PI / 360)) / (Math.PI / 180) * 20037508.34 / 180
    
    return [mercatorX, mercatorY]
  }

  /**
   * Parse SVG path data to OpenLayers geometry
   */
  private parsePath(d: string): Geometry | null {
    try {
      const commands = d.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZzZz]*/g) || []
      const coords: [number, number][] = []
      let currentX = 0
      let currentY = 0
      let startX = 0
      let startY = 0

      for (const cmd of commands) {
        const type = cmd[0]
        const isRelative = type === type.toLowerCase()
        const values = cmd.slice(1).trim().split(/[\s,]+/).filter(v => v !== '').map(Number)

        switch (type.toUpperCase()) {
          case 'M': // Move to
            currentX = isRelative ? currentX + values[0] : values[0]
            currentY = isRelative ? currentY + values[1] : values[1]
            startX = currentX
            startY = currentY
            coords.push(this.svgToMapCoords(currentX, currentY))
            break
          
          case 'L': // Line to
            currentX = isRelative ? currentX + values[0] : values[0]
            currentY = isRelative ? currentY + values[1] : values[1]
            coords.push(this.svgToMapCoords(currentX, currentY))
            break
          
          case 'H': // Horizontal line
            currentX = isRelative ? currentX + values[0] : values[0]
            coords.push(this.svgToMapCoords(currentX, currentY))
            break
          
          case 'V': // Vertical line
            currentY = isRelative ? currentY + values[0] : values[0]
            coords.push(this.svgToMapCoords(currentX, currentY))
            break
          
          case 'C': // Cubic bezier
            if (values.length >= 6) {
              // Add control points for proper curve interpolation
              const cp1x = isRelative ? currentX + values[0] : values[0]
              const cp1y = isRelative ? currentY + values[1] : values[1]
              const cp2x = isRelative ? currentX + values[2] : values[2]
              const cp2y = isRelative ? currentY + values[3] : values[3]
              const endX = isRelative ? currentX + values[4] : values[4]
              const endY = isRelative ? currentY + values[5] : values[5]
              
              // Interpolate bezier curve with multiple points
              const bezierPoints = this.interpolateCubicBezier(
                [currentX, currentY], [cp1x, cp1y], [cp2x, cp2y], [endX, endY], 10
              )
              bezierPoints.forEach(point => coords.push(this.svgToMapCoords(point[0], point[1])))
              
              currentX = endX
              currentY = endY
            }
            break
          
          case 'S': // Smooth cubic bezier
            if (values.length >= 4) {
              // Calculate reflected control point from previous curve
              const prevCoord = coords[coords.length - 1]
              const cp2x = isRelative ? currentX + values[0] : values[0]
              const cp2y = isRelative ? currentY + values[1] : values[1]
              const endX = isRelative ? currentX + values[2] : values[2]
              const endY = isRelative ? currentY + values[3] : values[3]
              
              // Simple interpolation for smooth curves
              const steps = 8
              for (let i = 1; i <= steps; i++) {
                const t = i / steps
                const x = currentX + t * (endX - currentX)
                const y = currentY + t * (endY - currentY)
                coords.push(this.svgToMapCoords(x, y))
              }
              
              currentX = endX
              currentY = endY
            }
            break
          
          case 'Q': // Quadratic bezier
            if (values.length >= 4) {
              const cpx = isRelative ? currentX + values[0] : values[0]
              const cpy = isRelative ? currentY + values[1] : values[1]
              const endX = isRelative ? currentX + values[2] : values[2]
              const endY = isRelative ? currentY + values[3] : values[3]
              
              // Interpolate quadratic bezier curve
              const quadPoints = this.interpolateQuadraticBezier(
                [currentX, currentY], [cpx, cpy], [endX, endY], 8
              )
              quadPoints.forEach(point => coords.push(this.svgToMapCoords(point[0], point[1])))
              
              currentX = endX
              currentY = endY
            }
            break
          
          case 'T': // Smooth quadratic bezier
            if (values.length >= 2) {
              const endX = isRelative ? currentX + values[0] : values[0]
              const endY = isRelative ? currentY + values[1] : values[1]
              
              // Simple interpolation for smooth curves
              const steps = 6
              for (let i = 1; i <= steps; i++) {
                const t = i / steps
                const x = currentX + t * (endX - currentX)
                const y = currentY + t * (endY - currentY)
                coords.push(this.svgToMapCoords(x, y))
              }
              
              currentX = endX
              currentY = endY
            }
            break
          
          case 'A': // Arc - approximate with line
            if (values.length >= 7) {
              currentX = isRelative ? currentX + values[5] : values[5]
              currentY = isRelative ? currentY + values[6] : values[6]
              coords.push(this.svgToMapCoords(currentX, currentY))
            }
            break
          
          case 'Z': // Close path
            if (coords.length > 2) {
              // Ensure path is properly closed
              const first = this.svgToMapCoords(startX, startY)
              const last = coords[coords.length - 1]
              if (Math.abs(first[0] - last[0]) > 1 || Math.abs(first[1] - last[1]) > 1) {
                coords.push(first) // Close the polygon
              }
              return new Polygon([coords])
            }
            break
        }
      }

      if (coords.length > 2) {
        // Check if it's a closed path by checking if first and last points are close
        const first = coords[0]
        const last = coords[coords.length - 1]
        const distance = Math.sqrt(Math.pow(first[0] - last[0], 2) + Math.pow(first[1] - last[1], 2))
        if (distance < 100) { // Increased threshold for Web Mercator coordinates
          // Add first point to close polygon if not already there
          if (distance > 1) {
            coords.push(first)
          }
          return new Polygon([coords])
        }
      }
      
      if (coords.length > 1) {
        return new LineString(coords)
      }
    } catch (error) {
      console.error('Error parsing path:', error)
    }
    return null
  }

  /**
   * Parse SVG circle to OpenLayers geometry
   */
  private parseCircle(circle: Element): Geometry | null {
    const cx = parseFloat(circle.getAttribute('cx') || '0')
    const cy = parseFloat(circle.getAttribute('cy') || '0')
    const r = parseFloat(circle.getAttribute('r') || '0')

    if (r <= 0) return null

    const center = this.svgToMapCoords(cx, cy)
    return new Point(center)
  }

  /**
   * Parse SVG ellipse to OpenLayers geometry
   */
  private parseEllipse(ellipse: Element): Geometry | null {
    const cx = parseFloat(ellipse.getAttribute('cx') || '0')
    const cy = parseFloat(ellipse.getAttribute('cy') || '0')
    const rx = parseFloat(ellipse.getAttribute('rx') || '0')
    const ry = parseFloat(ellipse.getAttribute('ry') || '0')

    if (rx <= 0 || ry <= 0) return null

    const center = this.svgToMapCoords(cx, cy)
    return new Point(center)
  }

  /**
   * Parse SVG rectangle to OpenLayers geometry
   */
  private parseRect(rect: Element): Geometry | null {
    const x = parseFloat(rect.getAttribute('x') || '0')
    const y = parseFloat(rect.getAttribute('y') || '0')
    const width = parseFloat(rect.getAttribute('width') || '0')
    const height = parseFloat(rect.getAttribute('height') || '0')

    if (width <= 0 || height <= 0) return null

    const coords = [
      this.svgToMapCoords(x, y),
      this.svgToMapCoords(x + width, y),
      this.svgToMapCoords(x + width, y + height),
      this.svgToMapCoords(x, y + height),
      this.svgToMapCoords(x, y)
    ]

    return new Polygon([coords])
  }

  /**
   * Parse SVG line to OpenLayers geometry
   */
  private parseLine(line: Element): Geometry | null {
    const x1 = parseFloat(line.getAttribute('x1') || '0')
    const y1 = parseFloat(line.getAttribute('y1') || '0')
    const x2 = parseFloat(line.getAttribute('x2') || '0')
    const y2 = parseFloat(line.getAttribute('y2') || '0')

    const coords = [
      this.svgToMapCoords(x1, y1),
      this.svgToMapCoords(x2, y2)
    ]

    return new LineString(coords)
  }

  /**
   * Parse SVG polygon to OpenLayers geometry
   */
  private parsePolygon(polygon: Element): Geometry | null {
    const points = polygon.getAttribute('points') || ''
    const coords = points.trim().split(/[\s,]+/).map((coord, index, array) => {
      if (index % 2 === 0) {
        const x = parseFloat(coord)
        const y = parseFloat(array[index + 1])
        return this.svgToMapCoords(x, y)
      }
      return null
    }).filter(Boolean) as [number, number][]

    if (coords.length > 2) {
      return new Polygon([coords])
    }
    return null
  }

  /**
   * Extract style from SVG element
   */
  private extractStyle(element: Element): SVGGeometry['style'] {
    const style = {
      fill: element.getAttribute('fill') || '#000000',
      stroke: element.getAttribute('stroke') || 'none',
      strokeWidth: parseFloat(element.getAttribute('stroke-width') || '1'),
      fillOpacity: parseFloat(element.getAttribute('fill-opacity') || '1'),
      strokeOpacity: parseFloat(element.getAttribute('stroke-opacity') || '1')
    }

    // Handle CSS styles
    const computedStyle = window.getComputedStyle(element)
    if (computedStyle) {
      if (computedStyle.fill !== 'none' && computedStyle.fill !== '') {
        style.fill = computedStyle.fill
      }
      if (computedStyle.stroke !== 'none' && computedStyle.stroke !== '') {
        style.stroke = computedStyle.stroke
      }
      if (computedStyle.strokeWidth) {
        style.strokeWidth = parseFloat(computedStyle.strokeWidth) || 1
      }
    }

    return style
  }

  /**
   * Create OpenLayers features from SVG geometries using GeoJSON format for identical behavior
   */
  createFeatures(geometries: SVGGeometry[]): Feature[] {
    // Convert SVG geometries to GeoJSON FeatureCollection
    const geojsonFeatures = geometries.map((geom, index) => {
      let geoJsonGeometry: any
      
      if (geom.geometry instanceof Point) {
        const coords = geom.geometry.getCoordinates()
        // Convert from Web Mercator to WGS84 for GeoJSON
        const [lon, lat] = transform(coords, 'EPSG:3857', 'EPSG:4326')
        geoJsonGeometry = {
          type: 'Point',
          coordinates: [lon, lat]
        }
      } else if (geom.geometry instanceof LineString) {
        const coords = geom.geometry.getCoordinates()
        // Convert coordinates from Web Mercator to WGS84
        const transformedCoords = coords.map(coord => 
          transform(coord, 'EPSG:3857', 'EPSG:4326')
        )
        geoJsonGeometry = {
          type: 'LineString',
          coordinates: transformedCoords
        }
      } else if (geom.geometry instanceof Polygon) {
        const coords = geom.geometry.getCoordinates()
        // Convert coordinates from Web Mercator to WGS84
        const transformedCoords = coords.map(ring => 
          ring.map(coord => transform(coord, 'EPSG:3857', 'EPSG:4326'))
        )
        geoJsonGeometry = {
          type: 'Polygon',
          coordinates: transformedCoords
        }
      } else {
        // Fallback
        geoJsonGeometry = {
          type: 'Point',
          coordinates: [0, 0]
        }
      }
      
      const properties: any = {
        name: `${geom.type}_${index}`,
        originalType: geom.type,
        source: 'svg'
      }
      
      // Add spline properties if needed
      if (this.isSplineGeometry(geom)) {
        properties.isSpline = true
        properties.splineOptions = {
          tension: 0.5,
          pointsPerSeg: 8,
          normalize: false
        }
      }
      
      return {
        type: 'Feature',
        properties,
        geometry: geoJsonGeometry
      }
    })
    
    const geojsonCollection = {
      type: 'FeatureCollection',
      features: geojsonFeatures
    }
    
    // Use OpenLayers GeoJSON format to create features - exactly like GeoJSON import
    const format = new GeoJSON()
    const features = format.readFeatures(geojsonCollection, {
      dataProjection: 'EPSG:4326', // Standard for GeoJSON
      featureProjection: 'EPSG:3857' // Map's projection
    })
    
    return features
  }

  /**
   * Adjust color opacity
   */
  private adjustOpacity(color: string, opacity: number): string {
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16)
      const g = parseInt(color.slice(3, 5), 16)
      const b = parseInt(color.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }
    return color
  }

  /**
   * Helper method to determine if geometry represents a spline
   */
  private isSplineGeometry(geom: SVGGeometry): boolean {
    // Consider paths with curves as splines, but not simple straight line paths
    if (geom.type === 'path' && geom.geometry instanceof LineString) {
      const coords = geom.geometry.getCoordinates()
      // If it has more than 3 points, it's likely a curved path
      return coords.length > 3
    }
    return false
  }

  /**
   * Interpolate cubic bezier curve
   */
  private interpolateCubicBezier(p0: [number, number], p1: [number, number], p2: [number, number], p3: [number, number], steps: number): [number, number][] {
    const points: [number, number][] = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = Math.pow(1 - t, 3) * p0[0] + 3 * Math.pow(1 - t, 2) * t * p1[0] + 3 * (1 - t) * Math.pow(t, 2) * p2[0] + Math.pow(t, 3) * p3[0]
      const y = Math.pow(1 - t, 3) * p0[1] + 3 * Math.pow(1 - t, 2) * t * p1[1] + 3 * (1 - t) * Math.pow(t, 2) * p2[1] + Math.pow(t, 3) * p3[1]
      points.push([x, y])
    }
    return points
  }

  /**
   * Interpolate quadratic bezier curve
   */
  private interpolateQuadraticBezier(p0: [number, number], p1: [number, number], p2: [number, number], steps: number): [number, number][] {
    const points: [number, number][] = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = Math.pow(1 - t, 2) * p0[0] + 2 * (1 - t) * t * p1[0] + Math.pow(t, 2) * p2[0]
      const y = Math.pow(1 - t, 2) * p0[1] + 2 * (1 - t) * t * p1[1] + Math.pow(t, 2) * p2[1]
      points.push([x, y])
    }
    return points
  }

  /**
   * Import SVG into a vector source
   */
  importSVGToSource(svgContent: string, source: VectorSource): void {
    const geometries = this.parseSVG(svgContent)
    const features = this.createFeatures(geometries)
    source.addFeatures(features)
  }
}