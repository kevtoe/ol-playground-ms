import MapContainer from "@/components/map/map-container"
import fs from "fs/promises"
import path from "path"
import type { Preset } from "@/lib/types"

async function getPresets(): Promise<Preset[]> {
  const presetsDirectory = path.join(process.cwd(), "app/presets")
  try {
    const filenames = await fs.readdir(presetsDirectory)
    const jsonFiles = filenames.filter((file) => path.extname(file) === ".json")

    const presets = await Promise.all(
      jsonFiles.map(async (filename) => {
        const filePath = path.join(presetsDirectory, filename)
        const fileContents = await fs.readFile(filePath, "utf8")
        const style = JSON.parse(fileContents)
        // Use the filename (without extension) as the preset name
        const name = path
          .basename(filename, ".json")
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())
        return { name, style, isDeletable: false }
      }),
    )
    return presets
  } catch (error) {
    // If the directory doesn't exist or there's an error, return an empty array
    console.warn("Could not read presets directory. This may be expected in some environments.", error)
    return []
  }
}

export default async function HomePage() {
  const presets = await getPresets()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
      <div className="relative w-full h-screen">
        <MapContainer serverPresets={presets} />
      </div>
    </main>
  )
}
