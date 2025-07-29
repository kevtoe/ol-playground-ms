"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ColorInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ColorInput({ id, label, value, onChange, className = "" }: ColorInputProps) {
  const { toast } = useToast()
  const [hexValue, setHexValue] = useState(value)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    setHexValue(value)
  }, [value])

  const handleHexChange = (newHex: string) => {
    setHexValue(newHex)
    if (/^#[0-9A-Fa-f]{6}$/.test(newHex)) {
      onChange(newHex)
    }
  }

  const handleHexBlur = () => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
      setHexValue(value)
    }
  }

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setHexValue(newColor)
    onChange(newColor)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setIsCopied(true)
      toast({ title: "Copied", description: "Color HEX copied to clipboard" })
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to copy color" })
    }
  }

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const colorMatch = text.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/i)
      if (colorMatch) {
        const hexColor = colorMatch[0].length === 4 ? 
          `#${colorMatch[0][1]}${colorMatch[0][1]}${colorMatch[0][2]}${colorMatch[0][2]}${colorMatch[0][3]}${colorMatch[0][3]}` : 
          colorMatch[0]
        setHexValue(hexColor)
        onChange(hexColor)
        toast({ title: "Pasted", description: "Color HEX pasted from clipboard" })
      } else {
        toast({ variant: "destructive", title: "Invalid", description: "No valid HEX color found" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to read from clipboard" })
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <Input
            id={`${id}-picker`}
            type="color"
            value={value}
            onChange={handleColorPickerChange}
            className="w-12 h-10 p-1 border-2 border-border rounded-md cursor-pointer"
          />
          <div className="flex-1 relative">
            <Input
              id={id}
              type="text"
              value={hexValue}
              onChange={(e) => handleHexChange(e.target.value)}
              onBlur={handleHexBlur}
              placeholder="#000000"
              className="font-mono h-10 pr-16 text-sm w-full"
              maxLength={7}
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={copyToClipboard}
                title="Copy HEX"
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={pasteFromClipboard}
                title="Paste HEX"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}