"use client"

import { Smartphone, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface MobileWarningProps {
  onShowAnyway: () => void
  screenWidth: number
}

export function MobileWarning({ onShowAnyway, screenWidth }: MobileWarningProps) {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-full bg-muted">
            <Smartphone className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Screen Too Small</CardTitle>
          <CardDescription>
            Your screen width ({screenWidth}px) is below the recommended minimum for this application.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Monitor className="h-4 w-4" />
            <span>Recommended: 680px or wider</span>
          </div>
          <p className="text-sm text-muted-foreground">
            For the best experience, please use a larger screen or desktop device.
          </p>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button 
            onClick={() => {
              // Store bypass flag in sessionStorage
              sessionStorage.setItem('forceDesktop', 'true')
              window.location.reload()
            }} 
            variant="outline" 
            className="flex-1"
          >
            Show me anyways
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}