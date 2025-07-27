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

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd ol-playground-ms

# Install dependencies
pnpm install

# Start development server
pnpm dev
\`\`\`

### Build for Production

\`\`\`bash
# Build the application
pnpm build

# Start production server
pnpm start
\`\`\`

## 🗂️ Project Structure

\`\`\`
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
\`\`\`

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
\`\`\`typescript
// Add to toolbar.tsx
tools.push({
  value: "new-tool",
  icon: <YourIcon />,
  label: "New Tool"
})
\`\`\`

### Creating Style Presets
\`\`\`json
{
  "name": "Custom Style",
  "style": {
    "strokeColor": "#ff0000",
    "strokeWidth": 3,
    "fillColor": "#ff000033"
  }
}
\`\`\`

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

## 🚀 v0.dev Integration Guide

This project is designed to work seamlessly with [v0.dev](https://v0.dev) for AI-powered UI development while maintaining full local GitHub integration.

### 🔗 **The v0.dev ↔ GitHub ↔ Local Triangle**

```
v0.dev Preview  ←→  GitHub  ←→  Local Development
     AI UI      ←    Git    →   Full Testing
```

### ⚠️ **CRITICAL SETUP: Library Files Required**

**For v0.dev preview to work correctly, you MUST download these files:**

```bash
# Run from project root:
mkdir -p public

# Download OpenLayers
curl -o public/ol.js https://cdn.jsdelivr.net/npm/ol@v9.2.4/dist/ol.js
curl -o public/ol.css https://cdn.jsdelivr.net/npm/ol@v9.2.4/dist/ol.css

# Download OpenLayers Extensions
curl -o public/ol-ext.js https://cdn.jsdelivr.net/npm/ol-ext@4.0.33/dist/ol-ext.js
curl -o public/ol-ext.css https://cdn.jsdelivr.net/npm/ol-ext@4.0.33/dist/ol-ext.css
```

**Required file structure:**
```
ol-playground-ms/
├── public/
│   ├── ol.js          # OpenLayers library (required)
│   ├── ol.css         # OpenLayers styles (required)
│   ├── ol-ext.js      # Extensions (UndoRedo, etc.)
│   └── ol-ext.css     # Extension styles (required)
└── ...
```

### 🔄 **Complete Workflow Examples**

#### **Scenario A: v0 → Local**
1. **v0.dev**: Generate new UI components with AI assistance
2. **Download files**: Run setup commands above
3. **Test locally**: `pnpm dev` for full functionality
4. **Commit changes**: Push to GitHub (include `/public` files!)

#### **Scenario B: Local → v0**
1. **Local development**: Make changes with full testing
2. **Push to GitHub**: Commit your changes
3. **Open in v0**: GitHub integration loads latest
4. **Continue iterating**: v0 loads from your GitHub repo

### 🛠️ **Environment Differences**

| Feature | v0.dev Preview | Local Development |
|---------|----------------|-------------------|
| **Library Source** | CDN fallback | `/public` files |
| **Development** | AI-assisted | Full testing |
| **Debugging** | Limited | Full debugger |
| **Hot Reload** | v0 preview | Next.js HMR |

### 📊 **Troubleshooting v0.dev Issues**

#### **MIME Type Error (Critical)**
- **Symptom**: `Content-Type: text/plain` errors
- **Root Cause**: v0.dev's module system conflicts with ol-ext's legacy architecture
- **Solution**: Download files to `/public` directory (commands above)
- **Files Required**: ol.js, ol.css, ol-ext.js, ol-ext.css

#### **Missing UndoRedo**
- **Symptom**: `window.ol.interaction.UndoRedo undefined`
- **Fix**: Ensure ol-ext.js loads after ol.js (handled automatically)

#### **Styling Issues**
- **Symptom**: Missing extension styles
- **Fix**: Include ol-ext.css in addition to ol.css

### 🎯 **Quick Start Checklist**

**For v0.dev compatibility:**
- [ ] Clone repository locally
- [ ] Run download commands above
- [ ] Verify `/public` directory contains all 4 files
- [ ] Test locally with `pnpm dev`
- [ ] Commit `/public` files to GitHub
- [ ] Import into v0.dev from GitHub

**For local development:**
- [ ] Follow standard Next.js setup below
- [ ] Ensure library files are downloaded
- [ ] Run `pnpm install && pnpm dev`

### 📁 v0.dev Setup (Local Files Required)

#### **Step 1: Library Files Setup**
Download these files to `/public` directory:
```bash
# Download OpenLayers
wget https://cdn.jsdelivr.net/npm/ol@v9.2.4/dist/ol.js -O public/ol.js
wget https://cdn.jsdelivr.net/npm/ol@v9.2.4/dist/ol.css -O public/ol.css

# Download OpenLayers Extensions  
wget https://cdn.jsdelivr.net/npm/ol-ext@4.0.33/dist/ol-ext.js -O public/ol-ext.js
wget https://cdn.jsdelivr.net/npm/ol-ext@4.0.33/dist/ol-ext.css -O public/ol-ext.css
```

#### **Step 2: Verify File Structure**
```
ol-playground-ms/
├── public/
│   ├── ol.js          # OpenLayers library
│   ├── ol.css         # OpenLayers styles
│   ├── ol-ext.js      # OpenLayers extensions
│   └── ol-ext.css     # Extension styles
├── components/
└── ...
```

#### **Step 3: Environment Detection**
The codebase automatically handles both environments:
- **v0.dev**: Uses CDN URLs when files aren't found locally
- **Local**: Uses `/public` directory files
- **Production**: Uses CDN as fallback

### 🔄 Workflow Examples

#### **Scenario 1: v0 → Local**
1. **Start in v0.dev**: Generate new UI components
2. **Download files**: Run setup commands above
3. **Test locally**: `pnpm dev` for full functionality
4. **Commit changes**: Push to GitHub

#### **Scenario 2: Local → v0**
1. **Develop locally**: Make changes with full testing
2. **Push to GitHub**: Commit your changes
3. **Open in v0**: GitHub integration loads latest
4. **Continue iterating**: v0 loads from your repo

### 🛠️ Environment Variables

Create `.env.local` for local development:
```bash
# Use local files (set to false for CDN fallback)
NEXT_PUBLIC_USE_LOCAL_LIBS=true
```

### 📊 Troubleshooting v0.dev Issues

#### **MIME Type Error**
- **Symptom**: `Content-Type 
