import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wind, RotateCcw, ZoomIn, ZoomOut, AlertTriangle, Settings } from 'lucide-react';
import { getDirectDTNToken, hasValidDTNToken } from '@/utils/dtnTokenManager';
import DirectTokenInput from './DirectTokenInput';
import WindLayerConfig from './WindLayerConfig';

// DTN Configuration - Updated with fresh token
const TILESET_ID = '16a81a7a-e6f0-4e5e-9bae-2b9283d1ead5';
let ACCESS_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpfX21pZW13NGhoTmdvQWQxR3N6ciJ9.eyJodHRwczovL2F1dGguZHRuLmNvbS9hY2NvdW50SWQiOiIyNTY1Mzk5IiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vdmVuZG9ySWQiOiJ1bmtub3duIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vY3VzdG9tZXJJZCI6IjI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9wcm9kdWN0Q29kZSI6IkRUTld4QVBJXzI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9yZXF1ZXN0ZXJJcCI6IjE4LjIxMy4xNzQuMjciLCJodHRwczovL2F1dGguZHRuLmNvbS9ycHMiOiIyNTAiLCJodHRwczovL2F1dGguZHRuLmNvbS90aWVyIjoiRW50ZXJwcmlzZSIsImh0dHBzOi8vYXV0aC5kdG4uY29tL3F1b3RhIjoiMTAwMDAwIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vYXJlYVNpemUiOiIwIiwiaXNzIjoiaHR0cHM6Ly9pZC5hdXRoLmR0bi5jb20vIiwic3ViIjoiRnpGbHZJajNjUFBhejhlc3B5ckhEN0FySnVlY0xOR1BAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbWFwLmFwaS5kdG4uY29tIiwiaWF0IjoxNzUyNDg3MDAyLCJleHAiOjE3NTI1NzM0MDIsInNjb3BlIjoicmVhZDpjYXRhbG9nLWRlZmF1bHQgd2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJGekZsdklqM2NQUGF6OGVzcHlySEQ3QXJKdWVjTE5HUCIsInBlcm1pc3Npb25zIjpbInJlYWQ6Y2F0YWxvZy1kZWZhdWx0Iiwid2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiXX0.CApw67WQo3KDz3mnj9foVTY6y1J9tU0pp4zSjHbjvqsIDhhQENx0hnfDVna1hzauGFD9g865Wj84md5eoCRf4k38u9TqvejNMNahg3cPpxLGbXekBx9e389x5PxgHeB7yi00493aUJKGZ1oFE9xF98a5xwpRfleT77G-bhQhEdRz4qjbsr2bZU93nUhVhBOrAuz1pqHbuFSvx3K1ivzKysResJEMbaSGOTlLnXiLcwz0co1f2oTm2qvZ-tV6e9XiSKdJa_BRlVZa0wt7pUD8Uls8e51L4bkHFFkdIvjNC-EA-0uTot39hfNhWdd1xOwP23OdRLV4epScllm_ymhssg';
const SOURCE_LAYER = 'fcst-onefx-wind-symbol-grid';

// Mapbox Configuration
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZ2Vvc2VydmUiLCJhIjoiY201Z2J3dXBpMDU2NjJpczRhbmJubWtxMCJ9.6Kw-zTqoQcNdDokBgbI5_Q';
const MAPBOX_STYLE = 'mapbox://styles/geoserve/cmb8z5ztq00rw01qxauh6gv66';

const WindMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [windLayerVisible, setWindLayerVisible] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [showWindConfig, setShowWindConfig] = useState(false);
  const [windLayerConfig, setWindLayerConfig] = useState<any>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Check for DTN token first
    if (!hasValidDTNToken()) {
      console.log('🚨 No DTN token found, showing token input');
      setShowTokenInput(true);
      setIsLoading(false);
      return;
    }

    initializeMap();

    // Listen for token updates
    const handleTokenUpdate = () => {
      console.log('🔄 DTN token updated, reinitializing map');
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      setMapLoaded(false);
      setIsLoading(true);
      setAuthError(false);
      setShowTokenInput(false);
      
      setTimeout(() => {
        if (hasValidDTNToken()) {
          initializeMap();
        } else {
          setShowTokenInput(true);
          setIsLoading(false);
        }
      }, 100);
    };

    // Listen for wind config updates
    const handleWindConfigUpdate = (event: CustomEvent) => {
      console.log('🎨 Wind config updated:', event.detail.config);
      setWindLayerConfig(event.detail.config);
      updateWindLayerStyling(event.detail.config);
    };

    window.addEventListener('dtnTokenUpdated', handleTokenUpdate);
    window.addEventListener('windConfigUpdate', handleWindConfigUpdate as EventListener);

    return () => {
      window.removeEventListener('dtnTokenUpdated', handleTokenUpdate);
      window.removeEventListener('windConfigUpdate', handleWindConfigUpdate as EventListener);
      map.current?.remove();
    };
  }, []);

  const initializeMap = () => {
    if (!mapContainer.current || !hasValidDTNToken()) return;

    // Set Mapbox access token
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_STYLE,
      center: [-40, 20], // Atlantic Ocean
      zoom: 3,
      maxZoom: 10,
      minZoom: 2,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Map load event
    map.current.on('load', () => {
      setIsLoading(false);
      setMapLoaded(true);
      
      if (!map.current) return;

      console.log('🗺️ Map loaded, adding DTN wind source...');

      // Get current DTN token
      const currentToken = getDirectDTNToken();
      if (!currentToken) {
        console.error('❌ No DTN token available');
        setShowTokenInput(true);
        return;
      }

      // Try multiple DTN API endpoints to find the correct one
      const possibleEndpoints = [
        `https://map.api.dtn.com/v2/tiles/${TILESET_ID}/{z}/{x}/{y}`,
        `https://api.dtn.com/weather/v2/tiles/${TILESET_ID}/{z}/{x}/{y}`,
        `https://weather.api.dtn.com/v2/tiles/${TILESET_ID}/{z}/{x}/{y}`
      ];

      console.log('🔍 Testing DTN endpoints...');
      console.log('- Tileset ID:', TILESET_ID);
      console.log('- Source Layer:', SOURCE_LAYER);

      // Use the first endpoint with proper authentication
      map.current.addSource('dtn-wind', {
        type: 'vector',
        tiles: [`${possibleEndpoints[0]}?access_token=${currentToken}`],
        minzoom: 0,
        maxzoom: 14,
        tileSize: 512,
        attribution: '© DTN Weather API',
      });

      // Monitor source loading
      map.current.on('sourcedata', (e) => {
        if (e.sourceId === 'dtn-wind') {
          console.log('📡 DTN source event:', { isSourceLoaded: e.isSourceLoaded, sourceDataType: e.sourceDataType });
          
          if (e.isSourceLoaded && e.sourceDataType === 'metadata') {
            console.log('✅ DTN source metadata loaded');
            setTimeout(() => addWindLayers(), 500);
          }
        }
      });

      addWindLayers();
    });

    // Handle map errors with specific DTN API error handling
    map.current.on('error', (e: any) => {
      console.error('🚨 Map error:', {
        error: e.error,
        message: e.error?.message,
        status: e.error?.status,
        url: e.error?.url,
        sourceId: e.sourceId
      });
      
      if (e.error?.status === 401) {
        console.error('🔐 Authentication failed - invalid DTN token');
        setAuthError(true);
        setShowTokenInput(true);
      } else if (e.error?.status === 404) {
        console.error('🔍 DTN endpoint not found - checking alternative endpoints');
        setAuthError(true);
        setShowTokenInput(true);
      } else if (e.sourceId === 'dtn-wind') {
        console.error('📡 DTN source error - may need token refresh');
        setAuthError(true);
      }
      
      setIsLoading(false);
    });
  };

  const addWindLayers = () => {
    if (!map.current || !mapLoaded) return;

    try {
      // Remove existing layers if they exist
      ['wind-speed-fill', 'wind-arrows', 'debug-all-features'].forEach(layerId => {
        if (map.current!.getLayer(layerId)) {
          map.current!.removeLayer(layerId);
        }
      });

      console.log('🎨 Adding wind visualization layers...');

      // 1. Wind speed fill layer
      map.current.addLayer({
        id: 'wind-speed-fill',
        type: 'fill',
        source: 'dtn-wind',
        'source-layer': SOURCE_LAYER,
        paint: {
          'fill-color': [
            'case',
            ['has', 'windSpeed'],
            [
              'interpolate',
              ['linear'],
              ['to-number', ['get', 'windSpeed']],
              0, '#22C55E',
              5, '#84CC16',
              10, '#EAB308',
              15, '#F97316',
              25, '#DC2626',
              35, '#7C2D12'
            ],
            ['has', 'wind_speed'],
            [
              'interpolate',
              ['linear'],
              ['to-number', ['get', 'wind_speed']],
              0, '#22C55E',
              5, '#84CC16',
              10, '#EAB308',
              15, '#F97316',
              25, '#DC2626',
              35, '#7C2D12'
            ],
            '#FF00FF'
          ],
          'fill-opacity': windLayerConfig?.textOpacity || 0.7
        },
        layout: {
          'visibility': windLayerVisible ? 'visible' : 'none'
        }
      });

      // 2. Debug layer to show any data
      map.current.addLayer({
        id: 'debug-all-features',
        type: 'fill',
        source: 'dtn-wind',
        'source-layer': SOURCE_LAYER,
        paint: {
          'fill-color': '#00FFFF',
          'fill-opacity': 0.2
        },
        layout: {
          'visibility': windLayerVisible ? 'visible' : 'none'
        }
      });

      console.log('✅ Wind layers added successfully');

      // Query features for debugging
      setTimeout(() => {
        if (map.current) {
          const features = map.current.querySourceFeatures('dtn-wind', {
            sourceLayer: SOURCE_LAYER
          });
          console.log(`🔍 Found ${features.length} wind features`);
          if (features.length > 0) {
            console.log('📊 Sample feature:', features[0].properties);
          }
        }
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error adding wind layers:', error);
    }
  };

  const updateWindLayerStyling = (config: any) => {
    if (!map.current || !mapLoaded || !config) return;

    try {
      // Update wind speed fill layer opacity
      if (map.current.getLayer('wind-speed-fill')) {
        map.current.setPaintProperty('wind-speed-fill', 'fill-opacity', config.textOpacity);
      }

      console.log('🎨 Wind layer styling updated');
    } catch (error) {
      console.error('❌ Error updating wind styling:', error);
    }
  };

  const handleValidToken = (newToken: string) => {
    // This is now handled by DirectTokenInput component
    setAuthError(false);
    setShowTokenInput(false);
    
    // Token update event will trigger map reload
  };

  const handleShowTokenInput = () => {
    setShowTokenInput(true);
  };

  const handleShowWindConfig = () => {
    setShowWindConfig(!showWindConfig);
  };

  const toggleWindLayer = () => {
    if (!map.current || !mapLoaded) return;
    
    const newVisibility = !windLayerVisible;
    setWindLayerVisible(newVisibility);
    
    const visibility = newVisibility ? 'visible' : 'none';
    
    // Toggle all wind-related layers
    try {
      if (map.current.getLayer('wind-speed-fill')) {
        map.current.setLayoutProperty('wind-speed-fill', 'visibility', visibility);
      }
      if (map.current.getLayer('wind-arrows')) {
        map.current.setLayoutProperty('wind-arrows', 'visibility', visibility);
      }
      if (map.current.getLayer('debug-all-features')) {
        map.current.setLayoutProperty('debug-all-features', 'visibility', visibility);
      }
      console.log('Toggled wind layer visibility to:', visibility);
    } catch (error) {
      console.error('Error toggling layer visibility:', error);
    }
  };

  const resetView = () => {
    if (!map.current) return;
    map.current.flyTo({
      center: [-40, 20],
      zoom: 3,
      duration: 2000
    });
  };

  const zoomIn = () => {
    if (!map.current) return;
    map.current.zoomIn({ duration: 500 });
  };

  const zoomOut = () => {
    if (!map.current) return;
    map.current.zoomOut({ duration: 500 });
  };

  return (
    <div className="relative w-full h-screen">
      {/* Show token input overlay if authentication fails */}
      {showTokenInput && (
        <div className="absolute inset-0 bg-background/95 flex items-center justify-center z-50 p-4">
          <DirectTokenInput />
        </div>
      )}

      {/* Show wind configuration panel */}
      {showWindConfig && (
        <div className="absolute inset-y-0 right-0 w-80 bg-background/95 border-l z-40 overflow-y-auto">
          <WindLayerConfig />
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Wind className="h-5 w-5 animate-spin text-primary" />
              <span className="text-foreground">Loading wind data...</span>
            </div>
          </Card>
        </div>
      )}

      {/* Debug Info Panel */}
      <div className="absolute top-4 right-4 z-20">
        <Card className="p-3 max-w-sm">
          <h4 className="text-xs font-semibold text-foreground mb-2">🔍 Debug Status</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Map: {mapLoaded ? '✅ Loaded' : '⏳ Loading'}</div>
            <div>Wind Layer: {windLayerVisible ? '👁️ Visible' : '🙈 Hidden'}</div>
            <div>Source Layer: {SOURCE_LAYER}</div>
            <div className="text-destructive font-medium">💡 Check console for detailed logs</div>
            <div className="text-xs bg-muted p-1 rounded mt-2">
              If you see <span className="text-cyan-500">cyan</span> areas, data is loading!
              <br />If you see <span className="text-pink-500">magenta</span>, check property names.
            </div>
          </div>
        </Card>
      </div>

      {/* Controls Panel */}
      <div className="absolute top-4 left-4 z-20 space-y-2">
        <Card className="p-3">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Wind className="h-4 w-4 text-primary" />
            Wind Overlay
          </h3>
          <Button
            variant={windLayerVisible ? "default" : "secondary"}
            size="sm"
            onClick={toggleWindLayer}
            disabled={!mapLoaded}
            className="w-full mb-2"
          >
            {windLayerVisible ? 'Hide Wind' : 'Show Wind'}
          </Button>
          
          {authError && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleShowTokenInput}
              className="w-full flex items-center gap-2 mb-2"
            >
              <AlertTriangle className="h-3 w-3" />
              Fix Auth
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleShowWindConfig}
            className="w-full flex items-center gap-2"
          >
            <Settings className="h-3 w-3" />
            Wind Config
          </Button>
        </Card>

        <Card className="p-3">
          <div className="space-y-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={resetView}
              disabled={!mapLoaded}
              className="w-full flex items-center gap-2"
            >
              <RotateCcw className="h-3 w-3" />
              Reset View
            </Button>
            <div className="flex gap-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={zoomIn}
                disabled={!mapLoaded}
                className="flex-1 flex items-center justify-center"
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={zoomOut}
                disabled={!mapLoaded}
                className="flex-1 flex items-center justify-center"
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20">
        <Card className="p-3">
          <h4 className="text-xs font-semibold text-foreground mb-2">Wind Speed (m/s)</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-wind-low rounded-sm" />
              <span className="text-xs text-muted-foreground">0-10 m/s</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-wind-medium rounded-sm" />
              <span className="text-xs text-muted-foreground">10-20 m/s</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-wind-high rounded-sm" />
              <span className="text-xs text-muted-foreground">20-30 m/s</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-wind-extreme rounded-sm" />
              <span className="text-xs text-muted-foreground">30+ m/s</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WindMap;