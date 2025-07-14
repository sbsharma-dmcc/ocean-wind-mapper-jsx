import React, { useState, useEffect } from "react";
import 'mapbox-gl/dist/mapbox-gl.css'; // Import Mapbox GL CSS styles
import MapTopControls from './MapTopControls';
import DirectTokenInput from './DirectTokenInput';
import MapLayerControls from './MapLayerControls';
import { useMapbox } from '@/hooks/useMapbox';
import { useLayerConfiguration } from '@/hooks/useLayerConfiguration';
import { useDTNLayers } from '@/hooks/useDTNLayers';
import { generateMockVessels } from '@/lib/vessel-data';

/**
 * Props interface for the MapboxMap component
 * Defines optional configuration parameters for the map
 */
interface MapboxMapProps {
  vessels?: any[];                           // Array of vessel data to display
  accessToken?: string;                      // Mapbox access token (if different from default)
  showRoutes?: boolean;                      // Whether to display route overlays
  baseRoute?: [number, number][];            // Coordinates for base route
  weatherRoute?: [number, number][];         // Coordinates for weather-optimized route
  activeRouteType?: 'base' | 'weather';      // Which route type is currently active
  activeLayers?: Record<string, boolean>;    // Map of layer names to their active state
  activeBaseLayer?: string;                  // Currently active base map layer
}

/**
 * Main WindMap component that renders a Mapbox map with DTN weather layers
 * Manages vessel display, wind layer controls, and map interactions
 */
const MapboxMap: React.FC<MapboxMapProps> = ({ 
  vessels = [],                    // Default to empty array if no vessels provided
  accessToken,                     // Optional custom access token
  showRoutes = false,              // Default to not showing routes
  baseRoute = [],                  // Default to empty route
  weatherRoute = [],               // Default to empty weather route
  activeRouteType = 'base',        // Default to base route type
  activeLayers = {},               // Default to no active layers
  activeBaseLayer = 'default'      // Default base layer
}) => {
  // State to control visibility of the layer control panel
  const [showLayers, setShowLayers] = useState(false);
  
  // State to store generated mock vessel data
  const [mapVessels, setMapVessels] = useState<any[]>([]);
  
  // Custom hooks for modular functionality
  const { mapContainerRef, mapref, isMapLoaded } = useMapbox(mapVessels); // Map initialization and vessel management
  const { layerConfigs } = useLayerConfiguration();                        // Wind layer configuration settings
  const { activeOverlays, handleOverlayClick, removeAllOverlays } = useDTNLayers(
    mapref.current,    // Pass map instance to DTN layers hook
    layerConfigs,      // Pass layer configurations
    activeLayers       // Pass active layer state
  );

  // Effect to generate mock vessel data when component mounts
  useEffect(() => {
    // Generate 25 mock vessels for demonstration
    const mockVessels = generateMockVessels(25);
    setMapVessels(mockVessels);
  }, []); // Empty dependency array - runs only once on mount

  return (
    <div className="relative h-full w-full">
      {/* Top navigation and search controls */}
      <MapTopControls />
      
      {/* DTN token input component for API authentication */}
      <DirectTokenInput />
      
      {/* Main map container - positioned absolutely to fill parent */}
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* Toggle button for wind layer controls */}
      <button
        onClick={() => setShowLayers(!showLayers)} // Toggle layer panel visibility
        className="absolute top-20 left-4 z-20 bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors hover-scale"
      >
        Toggle Wind Layer
      </button>

      {/* Wind layer control panel - shows/hides based on showLayers state */}
      <MapLayerControls
        showLayers={showLayers}                    // Controls panel visibility
        activeOverlays={activeOverlays}            // Currently active wind overlays
        onOverlayClick={handleOverlayClick}        // Handler for clicking overlay buttons
        onRemoveAllOverlays={removeAllOverlays}    // Handler for removing all overlays
      />
    </div>
  );
};

export default MapboxMap;