"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import type { ZoomSettings } from "@/lib/types"

interface SettingsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  settings: ZoomSettings
  onSettingsChange: (settings: ZoomSettings) => void
  currentResolution: number
}

export function SettingsDialog({
  isOpen,
  onOpenChange,
  settings,
  onSettingsChange,
  currentResolution,
}: SettingsDialogProps) {
  const handleFieldChange = (field: keyof ZoomSettings, value: any) => {
    onSettingsChange({ ...settings, [field]: value })
  }

  const handleStyleChange = (field: keyof ZoomSettings["style"], value: any) => {
    onSettingsChange({
      ...settings,
      style: {
        ...settings.style,
        [field]: value,
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Map Display Settings</DialogTitle>
          <DialogDescription>
            Adjust settings for how features are displayed at different zoom levels.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="default-zoom">Default Zoom Level</Label>
            <div className="flex items-center gap-2">
              <Slider
                id="default-zoom"
                min={1}
                max={20}
                step={1}
                value={[settings.defaultZoom]}
                onValueChange={([value]) => handleFieldChange("defaultZoom", value)}
              />
              <Input
                type="number"
                min={1}
                max={20}
                value={settings.defaultZoom}
                onChange={(e) => handleFieldChange("defaultZoom", Number(e.target.value))}
                className="w-20"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              The initial zoom level when the map loads (1 = world view, 20 = street level)
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="zoom-simplification" className="flex flex-col gap-1">
              <span>Zoom Simplification</span>
              <span className="font-normal text-muted-foreground text-xs">
                Simplify feature styles when zoomed out for better performance.
              </span>
            </Label>
            <Switch
              id="zoom-simplification"
              checked={settings.enabled}
              onCheckedChange={(checked) => handleFieldChange("enabled", checked)}
            />
          </div>
          {settings.enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="threshold">Simplification Threshold</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="threshold"
                    min={0.1}
                    max={100}
                    step={0.1}
                    value={[settings.threshold]}
                    onValueChange={([value]) => handleFieldChange("threshold", value)}
                  />
                  <Input
                    type="number"
                    value={settings.threshold}
                    onChange={(e) => handleFieldChange("threshold", Number(e.target.value))}
                    className="w-20"
                  />
                </div>
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Current Resolution: {currentResolution.toFixed(2)}</span>
                  {currentResolution > settings.threshold ? (
                    <Badge variant="secondary">Simplified</Badge>
                  ) : (
                    <Badge variant="outline">Detailed</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="automatic-color" className="flex flex-col gap-1">
                  <span>Automatic Color</span>
                  <span className="font-normal text-muted-foreground text-xs">
                    Use each feature's own color when simplified.
                  </span>
                </Label>
                <Switch
                  id="automatic-color"
                  checked={settings.automaticColor}
                  onCheckedChange={(checked) => handleFieldChange("automaticColor", checked)}
                />
              </div>
              {!settings.automaticColor && (
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-md">
                  <div className="space-y-2">
                    <Label htmlFor="stroke-color">Stroke Color</Label>
                    <Input
                      id="stroke-color"
                      type="color"
                      value={settings.style.strokeColor}
                      onChange={(e) => handleStyleChange("strokeColor", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fill-color">Fill Color</Label>
                    <Input
                      id="fill-color"
                      type="color"
                      value={settings.style.fillColor}
                      onChange={(e) => handleStyleChange("fillColor", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="stroke-width">Stroke Width</Label>
                    <Slider
                      id="stroke-width"
                      min={1}
                      max={10}
                      step={1}
                      value={[settings.style.strokeWidth]}
                      onValueChange={([value]) => handleStyleChange("strokeWidth", value)}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
