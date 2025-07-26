"use client"

import { useCallback } from "react"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Script from "next/script"
import { createStyleFunction } from "@/lib/style-manager"
import type { FeatureStyle } from "@/lib/types"

export function useOpenLayersMap(featureStyles: React.MutableRefObject<Map<string, FeatureStyle>>) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const vectorSource = useRef<any>(null)
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

  const styleFunction = useCallback(createStyleFunction(featureStyles), [featureStyles])

  useEffect(() => {
    if (scriptsLoaded && mapRef.current && !mapInstance.current) {
      const ol = (window as any).ol
      vectorSource.current = new ol.source.Vector()
      const vectorLayer = new ol.layer.Vector({ source: vectorSource.current, style: styleFunction })

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
        layers: [baseLayer.current, vectorLayer, handleLayer],
        view: new ol.View({ center: ol.proj.fromLonLat([121.505639, -30.777457]), zoom: 15 }),
      })
    }
  }, [scriptsLoaded, styleFunction])

  const Scripts = () => (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/ol@v9.2.4/dist/ol.js"
        strategy="afterInteractive"
        onLoad={() => setOlLoaded(true)}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/ol-ext@4.0.33/dist/ol-ext.js"
        strategy="afterInteractive"
        onLoad={() => setOlExtLoaded(true)}
      />
    </>
  )

  return {
    mapRef,
    mapInstance,
    vectorSource,
    handleSource,
    baseLayer,
    scriptsLoaded,
    Scripts,
  }
}
