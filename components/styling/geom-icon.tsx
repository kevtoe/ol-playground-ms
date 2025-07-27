import { Spline, RectangleHorizontal, Circle } from "lucide-react"

export function GeomIcon({ geomType }: { geomType: string }) {
  switch (geomType) {
    case "LineString":
      return <Spline className="h-4 w-4 text-muted-foreground" />
    case "Polygon":
      return <RectangleHorizontal className="h-4 w-4 text-muted-foreground" />
    case "Circle":
      return <Circle className="h-4 w-4 text-muted-foreground" />
    default:
      return <RectangleHorizontal className="h-4 w-4 text-muted-foreground" />
  }
}
