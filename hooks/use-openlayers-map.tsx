"use client"

import { useCallback } from "react"

import React, { useState, useEffect, useRef, useMemo } from "react"
import Script from "next/script"
import { createStyleFunction } from "@/lib/style-manager"
import type { FeatureStyle, ZoomSettings } from "@/lib/types"

export function useOpenLayersMap(
  featureStyles: React.MutableRefObject<Map<string, FeatureStyle>>,
  zoomSettings: ZoomSettings,
  layerOrderMapRef?: React.MutableRefObject<Map<string, number>>
) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const vectorSource = useRef<any>(null)
  const vectorLayer = useRef<any>(null)
  const handleSource = useRef<any>(null)
  const baseLayer = useRef<any>(null)
  const [scriptsLoaded, setScriptsLoaded] = useState(false)
  const [olLoaded, setOlLoaded] = useState(false)
  const [olExtLoaded, setOlExtLoaded] = useState(false)

  useEffect(() => {
    if (olLoaded && olExtLoaded) {
      setScriptsLoaded(true)
    }
  }, [olLoaded, olExtLoaded])

  const styleFunction = useMemo(() => {
    return createStyleFunction(
      featureStyles, 
      zoomSettings, 
      layerOrderMapRef || { current: new Map() }
    )
  }, [featureStyles, zoomSettings, layerOrderMapRef])

  useEffect(() => {
    if (scriptsLoaded && mapRef.current && !mapInstance.current) {
      const ol = (window as any).ol
      vectorSource.current = new ol.source.Vector()
      vectorLayer.current = new ol.layer.Vector({ source: vectorSource.current, style: styleFunction })

      handleSource.current = new ol.source.Vector()
      const moveIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9l-3 3 3 3"/><path d="M9 5l3-3 3 3"/><path d="M15 19l-3 3-3-3"/><path d="M19 9l3 3-3 3"/><path d="M2 12h20"/><path d="M12 2v20"/></svg>`
      const handleStyle = new ol.style.Style({
        image: new ol.style.Icon({
          src: "data:image/svg+xml;utf8," + encodeURIComponent(moveIconSvg),
          scale: 1,
          color: "black",
        }),
      })
      const handleLayer = new ol.layer.Vector({ source: handleSource.current, style: handleStyle, zIndex: 10000 })

      baseLayer.current = new ol.layer.Tile({ source: new ol.source.OSM() })

      mapInstance.current = new ol.Map({
        target: mapRef.current,
        layers: [baseLayer.current, vectorLayer.current, handleLayer],
        view: new ol.View({ center: ol.proj.fromLonLat([121.505639, -30.777457]), zoom: zoomSettings.defaultZoom }),
      })
    }
  }, [scriptsLoaded, styleFunction, zoomSettings.defaultZoom])

  useEffect(() => {
    if (mapInstance.current && vectorSource.current) {
      const layers = mapInstance.current.getLayers().getArray()
      if (vectorLayer.current) {
        vectorLayer.current.setStyle(styleFunction)
        vectorSource.current.changed()
      }
    }
  }, [styleFunction])

  // Handle zoom level changes
  useEffect(() => {
    if (mapInstance.current) {
      const view = mapInstance.current.getView()
      if (view) {
        view.setZoom(zoomSettings.defaultZoom)
      }
    }
  }, [zoomSettings.defaultZoom])

  const Scripts = () => (
    <React.Fragment>
      <Script
        src="/ol.js"
        strategy="afterInteractive"
        onLoad={() => setOlLoaded(true)}
      />
      <Script
        src="/ol-ext.js"
        strategy="afterInteractive"
        onLoad={() => setOlExtLoaded(true)}
      />
      <style>{`@import url('/ol-ext.css');`}</style>
    </React.Fragment>
  )

  return {
    mapRef,
    mapInstance,
    vectorSource,
    vectorLayer,
    handleSource,
    baseLayer,
    scriptsLoaded,
    Scripts,
  }
}
