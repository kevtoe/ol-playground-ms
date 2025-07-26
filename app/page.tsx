import MapContainer from "@/components/map/map-container"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
      <div className="relative w-full h-screen">
        <MapContainer />
      </div>
    </main>
  )
}
