"use client"

import React, { useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface SVGImportProps {
  onSVGImport: (svgContent: string, fileName: string) => void
}

export function SVGImport({ onSVGImport }: SVGImportProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processSVGFile = useCallback((file: File) => {
    if (!file.type.includes('svg') && !file.name.toLowerCase().endsWith('.svg')) {
      toast({
        title: "Invalid file type",
        description: "Please select an SVG file",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const svgContent = e.target?.result as string
      if (svgContent) {
        onSVGImport(svgContent, file.name)
        toast({
          title: "SVG imported",
          description: `Successfully imported ${file.name}`,
        })
      }
    }
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "Could not read the SVG file",
        variant: "destructive",
      })
    }
    reader.readAsText(file)
  }, [onSVGImport, toast])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: {
      'image/svg+xml': ['.svg']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        processSVGFile(acceptedFiles[0])
      }
    },
    onDropRejected: () => {
      toast({
        title: "Invalid file",
        description: "Please drop a valid SVG file",
        variant: "destructive",
      })
    }
  })

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processSVGFile(file)
    }
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
          ${isDragReject ? 'border-destructive bg-destructive/5' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-2">
          {isDragActive ? (
            <p className="text-sm text-primary">Drop the SVG file here...</p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Drag & drop an SVG file here, or click to select
              </p>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation()
                  handleButtonClick()
                }}
              >
                Browse Files
              </Button>
            </>
          )}
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <Alert>
        <AlertDescription>
          SVG files will be imported as editable vector layers. You can style and modify the geometries after import.
        </AlertDescription>
      </Alert>
    </div>
  )
}