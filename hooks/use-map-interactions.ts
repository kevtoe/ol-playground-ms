"use client"

import { useEffect, useRef, useCallback } from "react"
import { DEFAULT_POLYGON_STYLE, DEFAULT_LINE_STYLE } from "@/lib/style-manager"

export function useMapInteractions({
  map,
  vectorSource,
  handleSource,
  mode,
  scriptsLoaded,
  selectedFeatures,
  setSelectedFeatures,
  featureStyles,
  updateStyleCode,
}: any) {
  const interactions = useRef<{ [key: string]: any }>({})
  const selectInteractionRef = useRef<any>(null)

  // Ref to hold the latest selectedFeatures state to avoid stale closures in event listeners
  const selectedFeaturesRef = useRef(selectedFeatures)
  useEffect(() => {
    selectedFeaturesRef.current = selectedFeatures
  }, [selectedFeatures])

  // Effect to clear selection when mode changes
  useEffect(() => {
    if (selectInteractionRef.current) {
      selectInteractionRef.current.getFeatures().clear()
    }
  }, [mode])

  // Main effect for managing interactions
  useEffect(() => {
    if (!map || !scriptsLoaded) return

    const ol = (window as any).ol

    // Clear previous interactions from the map
    Object.values(interactions.current).forEach((interaction) => map.removeInteraction(interaction))
    interactions.current = {}
    selectInteractionRef.current = null
    handleSource.current.clear()

    let selectionListenerKey: any = null

    const handleDrawEnd = (e: any) => {
      const geomType = e.feature.getGeometry().getType()
      const defaultStyle =
        geomType === "Polygon" || geomType === "Circle" ? { ...DEFAULT_POLYGON_STYLE } : { ...DEFAULT_LINE_STYLE }
      featureStyles.current.set(ol.util.getUid(e.feature), JSON.parse(JSON.stringify(defaultStyle)))
    }

    switch (mode) {
      case "draw-line":
      case "draw-polygon":
      case "draw-rectangle":
      case "draw-circle":
        let drawType = "LineString"
        let geometryFunction
        if (mode === "draw-polygon") drawType = "Polygon"
        if (mode === "draw-circle") drawType = "Circle"
        if (mode === "draw-rectangle") {
          drawType = "Circle"
          geometryFunction = ol.interaction.Draw.createBox()
        }
        interactions.current.draw = new ol.interaction.Draw({
          source: vectorSource.current,
          type: drawType,
          geometryFunction,
        })
        interactions.current.draw.on("drawend", handleDrawEnd)
        map.addInteraction(interactions.current.draw)
        break

      case "draw-bezier":
        // Custom Bezier curve drawing implementation
        let isDrawing = false
        let currentPoints: number[][] = []
        let drawingFeature: any = null
        let tempSource: any = null
        
        // Create temporary source for preview
        tempSource = new ol.source.Vector()
        const tempLayer = new ol.layer.Vector({
          source: tempSource,
          style: new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'rgba(0, 0, 255, 0.6)',
              width: 2,
              lineDash: [5, 5]
            })
          }),
          zIndex: 1000
        })
        map.addLayer(tempLayer)

        const bezierClickHandler = (e: any) => {
          const coordinate = e.coordinate
          
          if (!isDrawing) {
            // Start drawing
            isDrawing = true
            currentPoints = [coordinate]
            drawingFeature = new ol.Feature(new ol.geom.LineString([coordinate, coordinate]))
            tempSource.addFeature(drawingFeature)
          } else {
            // Add point to curve
            currentPoints.push(coordinate)
            
            if (currentPoints.length >= 3) {
              // Generate smooth curve using cardinal spline
              const lineString = new ol.geom.LineString(currentPoints)
              if (typeof lineString.cspline === 'function') {
                try {
                  const smoothCurve = lineString.cspline({
                    tension: 0.5,
                    pointsPerSeg: 10,
                    normalize: false
                  })
                  drawingFeature.setGeometry(smoothCurve)
                } catch (error) {
                  drawingFeature.getGeometry().setCoordinates(currentPoints)
                }
              } else {
                drawingFeature.getGeometry().setCoordinates(currentPoints)
              }
            } else {
              // Update with current points
              drawingFeature.getGeometry().setCoordinates(currentPoints)
            }
          }
        }

        const bezierDoubleClickHandler = (e: any) => {
          if (isDrawing && currentPoints.length >= 2) {
            // Finish drawing - create feature with control points as LineString
            tempSource.removeFeature(drawingFeature)
            
            // Create feature with original control points as LineString geometry
            const controlPointsGeometry = new ol.geom.LineString(currentPoints)
            const finalFeature = new ol.Feature(controlPointsGeometry)
            
            // Mark this as a spline feature for special styling
            finalFeature.set('isSpline', true)
            finalFeature.set('splineOptions', {
              tension: 0.5,
              pointsPerSeg: 10,
              normalize: false
            })
            
            vectorSource.current.addFeature(finalFeature)
            
            // Apply default style
            const defaultStyle = { ...DEFAULT_LINE_STYLE }
            featureStyles.current.set(ol.util.getUid(finalFeature), JSON.parse(JSON.stringify(defaultStyle)))
            
            // Reset state
            isDrawing = false
            currentPoints = []
            drawingFeature = null
          }
          e.preventDefault()
          e.stopPropagation()
        }

        const bezierPointerMoveHandler = (e: any) => {
          if (isDrawing && drawingFeature && currentPoints.length > 0) {
            const coordinate = e.coordinate
            const previewPoints = [...currentPoints, coordinate]
            
            if (previewPoints.length >= 3) {
              // Generate smooth curve preview using cardinal spline
              const lineString = new ol.geom.LineString(previewPoints)
              if (typeof lineString.cspline === 'function') {
                try {
                  const smoothCurve = lineString.cspline({
                    tension: 0.5,
                    pointsPerSeg: 10,
                    normalize: false
                  })
                  drawingFeature.setGeometry(smoothCurve)
                } catch (error) {
                  drawingFeature.getGeometry().setCoordinates(previewPoints)
                }
              } else {
                drawingFeature.getGeometry().setCoordinates(previewPoints)
              }
            } else {
              // For less than 3 points, just show straight lines
              drawingFeature.getGeometry().setCoordinates(previewPoints)
            }
          }
        }

        // Add event listeners
        map.on('click', bezierClickHandler)
        map.on('dblclick', bezierDoubleClickHandler)
        map.on('pointermove', bezierPointerMoveHandler)
        
        // Store cleanup function
        interactions.current.bezierCleanup = () => {
          map.un('click', bezierClickHandler)
          map.un('dblclick', bezierDoubleClickHandler)
          map.un('pointermove', bezierPointerMoveHandler)
          if (tempSource) {
            map.removeLayer(tempLayer)
          }
        }
        break

      case "select":
        const selectInteraction = new ol.interaction.Select({
          style: null,
          hitTolerance: 5,
          condition: ol.events.condition.click,
          toggleCondition: ol.events.condition.shiftKeyOnly,
          multi: true,
        })
        interactions.current.select = selectInteraction
        selectInteractionRef.current = selectInteraction

        const selectionCollection = selectInteraction.getFeatures()
        selectionListenerKey = selectionCollection.on("change:length", () => {
          const currentSelection = selectionCollection.getArray()
          const previousSelection = selectedFeaturesRef.current

          const currentUIDs = new Set(currentSelection.map((f: any) => ol.util.getUid(f)))

          previousSelection.forEach((f: any) => {
            if (!currentUIDs.has(ol.util.getUid(f))) {
              f.set("selected", false)
            }
          })

          currentSelection.forEach((f: any) => {
            f.set("selected", true)
          })

          setSelectedFeatures(currentSelection.slice())

          handleSource.current.clear()
          if (currentSelection.length === 1) {
            const feature = currentSelection[0]
            const extent = feature.getGeometry().getExtent()
            const center = ol.extent.getCenter(extent)
            const handleFeature = new ol.Feature({
              geometry: new ol.geom.Point(center),
              owner: ol.util.getUid(feature),
            })
            handleSource.current.addFeature(handleFeature)
          }
          vectorSource.current.changed()
        })

        const dragBoxInteraction = new ol.interaction.DragBox({
          condition: ol.events.condition.shiftKeyOnly,
        })
        interactions.current.dragBox = dragBoxInteraction

        dragBoxInteraction.on("boxend", () => {
          const extent = dragBoxInteraction.getGeometry().getExtent()
          const selectFeatures = selectInteraction.getFeatures()

          const featuresInBox: any[] = []
          vectorSource.current.forEachFeatureInExtent(extent, (feature: any) => {
            featuresInBox.push(feature)
          })

          const newSelections = featuresInBox.filter((f) => !selectFeatures.getArray().includes(f))
          selectFeatures.extend(newSelections)
        })

        const modifyInteraction = new ol.interaction.Modify({
          features: selectInteraction.getFeatures(),
          style: new ol.style.Style({
            image: new ol.style.Circle({
              radius: 6,
              fill: new ol.style.Fill({ color: "#0099ff" }),
              stroke: new ol.style.Stroke({ color: "white", width: 2 }),
            }),
            zIndex: Number.POSITIVE_INFINITY,
          }),
        })
        
        // Listen for modify events to trigger style refresh for splines
        modifyInteraction.on('modifyend', (e: any) => {
          e.features.forEach((feature: any) => {
            if (feature.get('isSpline')) {
              // Force refresh of spline curve by triggering style recalculation
              vectorSource.current.changed()
            }
          })
        })
        
        interactions.current.modify = modifyInteraction

        const translateHandleInteraction = new ol.interaction.Translate({
          layers: [
            map
              .getLayers()
              .getArray()
              .find((l: any) => l.getSource() === handleSource.current),
          ],
          hitTolerance: 10,
        })
        interactions.current.translateHandle = translateHandleInteraction

        let ownerFeature: any = null
        let originalOwnerGeometry: any = null

        translateHandleInteraction.on("translatestart", (e: any) => {
          const handleFeature = e.features.getArray()[0]
          if (!handleFeature) return

          // Deactivate modify interaction to prevent conflicts
          if (interactions.current.modify) {
            interactions.current.modify.setActive(false)
          }

          const ownerUid = handleFeature.get("owner")
          ownerFeature = vectorSource.current.getFeatures().find((f: any) => ol.util.getUid(f) === ownerUid)

          if (ownerFeature) {
            originalOwnerGeometry = ownerFeature.getGeometry().clone()
          } else {
            ownerFeature = null
            originalOwnerGeometry = null
          }
        })

        translateHandleInteraction.on("translating", (e: any) => {
          if (!ownerFeature || !originalOwnerGeometry) return

          const deltaX = e.coordinate[0] - e.startCoordinate[0]
          const deltaY = e.coordinate[1] - e.startCoordinate[1]

          const newGeometry = originalOwnerGeometry.clone()
          newGeometry.translate(deltaX, deltaY)
          ownerFeature.setGeometry(newGeometry)
        })

        translateHandleInteraction.on("translateend", (e: any) => {
          if (ownerFeature) {
            const handleFeature = e.features.getArray()[0]
            const newExtent = ownerFeature.getGeometry().getExtent()
            const newCenter = ol.extent.getCenter(newExtent)
            handleFeature.getGeometry().setCoordinates(newCenter)
          }
          ownerFeature = null
          originalOwnerGeometry = null

          // Re-activate modify interaction
          if (interactions.current.modify) {
            interactions.current.modify.setActive(true)
          }
        })

        const hoverInteraction = new ol.interaction.Select({
          condition: ol.events.condition.pointerMove,
          style: null,
          hitTolerance: 5,
        })
        interactions.current.hover = hoverInteraction

        let currentlyHovered: any = null
        hoverInteraction.on("select", (e: any) => {
          if (currentlyHovered) {
            currentlyHovered.set("hovered", false)
            currentlyHovered = null
          }
          if (e.selected.length > 0) {
            currentlyHovered = e.selected[0]
            currentlyHovered.set("hovered", true)
          }
          vectorSource.current.changed()
        })

        map.addInteraction(selectInteraction)
        map.addInteraction(dragBoxInteraction)
        map.addInteraction(modifyInteraction)
        map.addInteraction(translateHandleInteraction)
        map.addInteraction(hoverInteraction)
        break

      case "offset":
        if (ol.interaction.Offset) {
          const offsetLinesInteraction = new ol.interaction.Offset({
            source: vectorSource.current,
            filter: (feature: any) => feature.getGeometry().getType() === "LineString",
          })
          interactions.current.offsetLines = offsetLinesInteraction
          map.addInteraction(offsetLinesInteraction)

          offsetLinesInteraction.on("offset:end", (e: any) => {
            const originalFeature = e.original
            const newFeature = e.feature
            const originalUid = ol.util.getUid(originalFeature)
            const newUid = ol.util.getUid(newFeature)

            const originalStyle = featureStyles.current.get(originalUid)
            if (originalStyle) {
              featureStyles.current.set(newUid, JSON.parse(JSON.stringify(originalStyle)))
            }
          })
        } else {
          console.warn("ol.interaction.Offset not found. Is ol-ext loaded?")
        }

        if (ol.interaction.Transform) {
          const transformInteraction = new ol.interaction.Transform({
            filter: (feature: any) => {
              const geomType = feature.getGeometry().getType()
              return geomType === "Polygon" || geomType === "Circle"
            },
            scale: true,
            rotate: false,
            stretch: true,
          })
          interactions.current.transformShapes = transformInteraction
          map.addInteraction(transformInteraction)
        } else {
          console.warn("ol.interaction.Transform not found. Is ol-ext loaded?")
        }
        break

      case "delete":
        const deleteHoverInteraction = new ol.interaction.Select({
          condition: ol.events.condition.pointerMove,
          style: new ol.style.Style({
            stroke: new ol.style.Stroke({ color: "rgba(255, 0, 0, 0.7)", width: 8 }),
            fill: new ol.style.Fill({ color: "rgba(255, 0, 0, 0.3)" }),
          }),
        })
        interactions.current.deleteHover = deleteHoverInteraction
        map.addInteraction(deleteHoverInteraction)

        const deleteClickInteraction = new ol.interaction.Select({
          condition: ol.events.condition.click,
          style: null,
        })
        interactions.current.deleteClick = deleteClickInteraction
        deleteClickInteraction.on("select", (e: any) => {
          const featureToDelete = e.selected[0]
          if (featureToDelete) {
            if (selectInteractionRef.current) {
              selectInteractionRef.current.getFeatures().remove(featureToDelete)
            }
            vectorSource.current.removeFeature(featureToDelete)
            featureStyles.current.delete(ol.util.getUid(featureToDelete))
            deleteClickInteraction.getFeatures().clear()
            deleteHoverInteraction.getFeatures().clear()
          }
        })
        map.addInteraction(deleteClickInteraction)
        break
    }

    return () => {
      if (selectionListenerKey) {
        ol.Observable.unByKey(selectionListenerKey)
      }
      
      // Handle special cleanup for Bezier mode
      if (interactions.current.bezierCleanup) {
        interactions.current.bezierCleanup()
      }
      
      Object.values(interactions.current).forEach((interaction) => {
        if (interaction && typeof interaction.setActive === 'function') {
          map.removeInteraction(interaction)
        }
      })
      interactions.current = {}
    }
  }, [mode, map, scriptsLoaded, vectorSource, handleSource, setSelectedFeatures, featureStyles, updateStyleCode])

  const clearSelection = useCallback(() => {
    if (selectInteractionRef.current) {
      selectInteractionRef.current.getFeatures().clear()
    }
  }, [])

  return { clearSelection }
}
