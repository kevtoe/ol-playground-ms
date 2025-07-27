# OpenLayers Playground

A modern, interactive mapping application built with OpenLayers, React, and Next.js. Create, style, and manage geospatial features with an intuitive interface.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![OpenLayers](https://img.shields.io/badge/OpenLayers-9.2-blue?style=flat-square)](https://openlayers.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

## ✨ Features

### 🗺️ Interactive Mapping
- **OpenLayers Integration**: Full-featured mapping with vector layers and styling
- **Multiple Drawing Tools**: Line, Polygon, Bezier curves, Circle, Rectangle
- **Real-time Editing**: Select, modify, and transform geometries
- **Drag & Drop**: Import GeoJSON files directly onto the map

### 🎨 Advanced Styling
- **Visual Presets**: Pre-configured style templates for quick application
- **Layer Editor**: Fine-tune stroke, fill, patterns, and arrows
- **Zoom-based Styling**: Automatic style simplification for performance
- **Customizable Defaults**: Set your own default styles for new features

### 🔧 Professional Tools
- **Coordinate Display**: Real-time center coordinates and zoom level
- **Feature Management**: Select, delete, and clear all features
- **Settings Panel**: Configure zoom thresholds and display options
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ol-playground-ms

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Build for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 🗂️ Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout with fonts and styles
│   └── presets/           # Default style presets
├── components/
│   ├── map/               # Map container and interactions
│   ├── toolbar/           # Drawing tools and controls
│   ├── styling/           # Style editors and panels
│   ├── presets/           # Preset management
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and types
└── styles/                # Global styles and themes
```

## 🛠️ Core Components

### MapContainer (`/components/map/map-container.tsx`)
Main mapping interface handling OpenLayers integration, user interactions, and state management.

### Toolbar (`/components/toolbar/toolbar.tsx`)
Floating toolbar with drawing tools and editing controls.

### StylingPanel (`/components/styling/styling-panel.tsx`)
Advanced styling interface for selected features.

### useOpenLayersMap (`/hooks/use-openlayers-map.tsx`)
Custom hook for OpenLayers map initialization and management.

## 🎯 Drawing Tools

| Tool | Description | Icon |
|------|-------------|------|
| **Select** | Select and modify existing features | Mouse Pointer |
| **Line** | Draw straight lines | Pen Line |
| **Bezier** | Draw curved lines | Spline |
| **Polygon** | Draw polygon shapes | Triangle Right |
| **Circle** | Draw perfect circles | Circle |
| **Rectangle** | Draw rectangles | Square |
| **Offset** | Transform and offset features | Move |
| **Delete** | Remove selected features | Trash |

## 📊 Style Management

### Color & Appearance
- **Stroke**: Color, width, dash patterns
- **Fill**: Solid colors, gradients, transparency
- **Arrows**: Custom arrowheads for lines
- **Patterns**: Hatch patterns and textures

### Zoom-Based Optimization
- Automatic style simplification at low zoom levels
- Configurable threshold for performance optimization
- Maintains visual clarity while improving performance

## 📁 Data Management

### Import
- **GeoJSON Support**: Drag and drop GeoJSON files
- **Automatic Styling**: Apply default styles to imported features
- **Extent Fitting**: Automatically zoom to imported data

### Export
- **Presets**: Save and load style configurations
- **Session Storage**: Temporary preset management
- **File-based**: Persistent presets in development

## ⚙️ Configuration

### Map Settings
- **Default Zoom**: Configurable starting zoom level
- **Center Coordinates**: Initial map center point
- **Style Threshold**: Zoom level for simplification
- **Performance**: Automatic optimization settings

### Development
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **ESLint**: Code quality enforcement
- **Next.js 15**: Latest features and optimizations

## 🎨 Customization

### Adding New Drawing Tools
```typescript
// Add to toolbar.tsx
tools.push({
  value: "new-tool",
  icon: <YourIcon />,
  label: "New Tool"
})
```

### Creating Style Presets
```json
{
  "name": "Custom Style",
  "style": {
    "strokeColor": "#ff0000",
    "strokeWidth": 3,
    "fillColor": "#ff000033"
  }
}
```

## 📱 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with** ❤️ using OpenLayers, Next.js, and TypeScript