import React, { useState, useEffect } from "react";
import 'mapbox-gl/dist/mapbox-gl.css';
import MapTopControls from './MapTopControls';
import DirectTokenInput from './DirectTokenInput';
import MapLayerControls from './MapLayerControls';
import { useMapbox } from '@/hooks/useMapbox';
import { useLayerConfiguration } from '@/hooks/useLayerConfiguration';
import { useDTNLayers } from '@/hooks/useDTNLayers';
import { generateMockVessels } from '@/lib/vessel-data';

interface MapboxMapProps {
  vessels?: any[];
  accessToken?: string;
  showRoutes?: boolean;
  baseRoute?: [number, number][];
  weatherRoute?: [number, number][];
  activeRouteType?: 'base' | 'weather';
  activeLayers?: Record<string, boolean>;
  activeBaseLayer?: string;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ 
  vessels = [],
  accessToken,
  showRoutes = false,
  baseRoute = [],
  weatherRoute = [],
  activeRouteType = 'base',
  activeLayers = {},
  activeBaseLayer = 'default'
}) => {
  const [showLayers, setShowLayers] = useState(false);
  const [mapVessels, setMapVessels] = useState<any[]>([]);
  
  // Custom hooks for modular functionality
  const { mapContainerRef, mapref, isMapLoaded } = useMapbox(mapVessels);
  const { layerConfigs } = useLayerConfiguration();
  const { activeOverlays, handleOverlayClick, removeAllOverlays } = useDTNLayers(
    mapref.current, 
    layerConfigs, 
    activeLayers
  );

  // Generate vessels when component mounts
  useEffect(() => {
    const mockVessels = generateMockVessels(25);
    setMapVessels(mockVessels);
  }, []);

  return (
    <div className="relative h-full w-full">
      <MapTopControls />
      <DirectTokenInput />
      <div ref={mapContainerRef} className="absolute inset-0" />

      <button
        onClick={() => setShowLayers(!showLayers)}
        className="absolute top-20 left-4 z-20 bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors hover-scale"
      >
        Toggle DTN Layers
      </button>

      <MapLayerControls
        showLayers={showLayers}
        activeOverlays={activeOverlays}
        onOverlayClick={handleOverlayClick}
        onRemoveAllOverlays={removeAllOverlays}
      />
    </div>
  );
};

export default MapboxMap;