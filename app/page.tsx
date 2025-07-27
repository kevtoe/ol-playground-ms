import MapContainer from "@/components/map/map-container"
import type { Preset, FeatureStyle } from "@/lib/types"

// Import preset JSON files directly - works in both server and browser environments
import defaultLinePresetJson from "./presets/default-line-preset.json"
import defaultPolygonPresetJson from "./presets/default-polygon-preset.json"
import defaultPolygonRedWithHatchJson from "./presets/default-polygon-red-with-hatch.json"

function getPresets(): Preset[] {
  try {
    const presets: Preset[] = [
      {
        name: "Default Line Preset",
        style: defaultLinePresetJson as FeatureStyle,
        isDeletable: false,
      },
      {
        name: "Default Polygon Preset", 
        style: defaultPolygonPresetJson as FeatureStyle,
        isDeletable: false,
      },
      {
        name: "Default Polygon Red With Hatch",
        style: defaultPolygonRedWithHatchJson as FeatureStyle,
        isDeletable: false,
      },
    ]
    return presets
  } catch (error) {
    console.warn("Could not load presets.", error)
    return []
  }
}

export default function HomePage() {
  const presets = getPresets()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
      <div className="relative w-full h-screen">
        <MapContainer serverPresets={presets} />
      </div>
    </main>
  )
}
