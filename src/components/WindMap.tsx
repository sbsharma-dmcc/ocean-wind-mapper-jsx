import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wind, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

// DTN Configuration - Updated with fresh token
const TILESET_ID = '16a81a7a-e6f0-4e5e-9bae-2b9283d1ead5';
const ACCESS_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpfX21pZW13NGhoTmdvQWQxR3N6ciJ9.eyJodHRwczovL2F1dGguZHRuLmNvbS9hY2NvdW50SWQiOiIyNTY1Mzk5IiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vdmVuZG9ySWQiOiJ1bmtub3duIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vY3VzdG9tZXJJZCI6IjI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9wcm9kdWN0Q29kZSI6IkRUTld4QVBJXzI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9yZXF1ZXN0ZXJJcCI6IjE4LjIxMy4xNzQuMjciLCJodHRwczovL2F1dGguZHRuLmNvbS9ycHMiOiIyNTAiLCJodHRwczovL2F1dGguZHRuLmNvbS90aWVyIjoiRW50ZXJwcmlzZSIsImh0dHBzOi8vYXV0aC5kdG4uY29tL3F1b3RhIjoiMTAwMDAwIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vYXJlYVNpemUiOiIwIiwiaXNzIjoiaHR0cHM6Ly9pZC5hdXRoLmR0bi5jb20vIiwic3ViIjoiRnpGbHZJajNjUFBhejhlc3B5ckhEN0FySnVlY0xOR1BAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbWFwLmFwaS5kdG4uY29tIiwiaWF0IjoxNzUyNDg3MDAyLCJleHAiOjE3NTI1NzM0MDIsInNjb3BlIjoicmVhZDpjYXRhbG9nLWRlZmF1bHQgd2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJGekZsdklqM2NQUGF6OGVzcHlySEQ3QXJKdWVjTE5HUCIsInBlcm1pc3Npb25zIjpbInJlYWQ6Y2F0YWxvZy1kZWZhdWx0Iiwid2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiXX0.CApw67WQo3KDz3mnj9foVTY6y1J9tU0pp4zSjHbjvqsIDhhQENx0hnfDVna1hzauGFD9g865Wj84md5eoCRf4k38u9TqvejNMNahg3cPpxLGbXekBx9e389x5PxgHeB7yi00493aUJKGZ1oFE9xF98a5xwpRfleT77G-bhQhEdRz4qjbsr2bZU93nUhVhBOrAuz1pqHbuFSvx3K1ivzKysResJEMbaSGOTlLnXiLcwz0co1f2oTm2qvZ-tV6e9XiSKdJa_BRlVZa0wt7pUD8Uls8e51L4bkHFFkdIvjNC-EA-0uTot39hfNhWdd1xOwP23OdRLV4epScllm_ymhssg';
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

  useEffect(() => {
    if (!mapContainer.current) return;

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

      console.log('Map loaded, attempting to add DTN wind source...');

      // Try DTN wind vector source with different URL format
      const dtnTileUrl = `https://map.api.dtn.com/v2/tiles/${TILESET_ID}/{z}/{x}/{y}`;
      
      console.log('DTN Tile URL:', dtnTileUrl);
      console.log('Access Token (first 50 chars):', ACCESS_TOKEN.substring(0, 50) + '...');

      map.current.addSource('dtn-wind', {
        type: 'vector',
        tiles: [dtnTileUrl],
        minzoom: 2,
        maxzoom: 10,
        transformRequest: (url, resourceType) => {
          console.log('Transform request for:', url, 'Type:', resourceType);
          if (url.startsWith('https://map.api.dtn.com')) {
            return {
              url: `${url}?access_token=${ACCESS_TOKEN}`,
              headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
              }
            };
          }
          return { url };
        }
      });

      // Add source data event listener
      map.current.on('sourcedata', (e) => {
        if (e.sourceId === 'dtn-wind') {
          console.log('DTN Wind source data event:', e);
          if (e.isSourceLoaded) {
            console.log('DTN Wind source fully loaded');
          }
        }
      });

      // Add wind speed color layer with more visible styling for debugging
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
              ['get', 'windSpeed'],
              0, '#22C55E',      // Low wind - green
              10, '#EAB308',     // Medium wind - yellow
              20, '#F97316',     // High wind - orange
              30, '#DC2626',     // Extreme wind - red
              50, '#7C2D12'      // Very extreme - dark red
            ],
            '#FF00FF'  // Magenta fallback for debugging
          ],
          'fill-opacity': 0.8
        },
        layout: {
          'visibility': windLayerVisible ? 'visible' : 'none'
        }
      });

      // Add a test layer to show any vector data
      map.current.addLayer({
        id: 'debug-all-features',
        type: 'fill',
        source: 'dtn-wind',
        'source-layer': SOURCE_LAYER,
        paint: {
          'fill-color': '#00FFFF',  // Cyan for debugging
          'fill-opacity': 0.3
        },
        layout: {
          'visibility': windLayerVisible ? 'visible' : 'none'
        }
      });

      // Log layer info for debugging
      setTimeout(() => {
        if (map.current) {
          const layers = map.current.getStyle().layers;
          console.log('All map layers:', layers.map(l => l.id));
          
          const source = map.current.getSource('dtn-wind');
          console.log('DTN Wind source:', source);
          
          const features = map.current.querySourceFeatures('dtn-wind', {
            sourceLayer: SOURCE_LAYER
          });
          console.log('DTN Wind features found:', features.length);
          if (features.length > 0) {
            console.log('Sample feature:', features[0]);
          }
        }
      }, 3000);
    });

    // Handle map errors with more detailed logging
    map.current.on('error', (e: any) => {
      console.error('Map error details:', {
        error: e.error,
        message: e.error?.message,
        status: e.error?.status,
        url: e.error?.url,
        sourceId: e.sourceId
      });
      
      if (e.error?.status === 401) {
        console.error('Authentication failed - DTN access token may be expired or invalid');
        // You might want to show a user-friendly message here
      }
      
      setIsLoading(false);
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  const toggleWindLayer = () => {
    if (!map.current || !mapLoaded) return;
    
    const newVisibility = !windLayerVisible;
    setWindLayerVisible(newVisibility);
    
    const visibility = newVisibility ? 'visible' : 'none';
    
    // Toggle all wind-related layers
    try {
      map.current.setLayoutProperty('wind-speed-fill', 'visibility', visibility);
      map.current.setLayoutProperty('debug-all-features', 'visibility', visibility);
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

      {/* Debug Info */}
      <div className="absolute top-4 right-4 z-20">
        <Card className="p-3 max-w-sm">
          <h4 className="text-xs font-semibold text-foreground mb-2">Debug Info</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Map Loaded: {mapLoaded ? '✓' : '✗'}</div>
            <div>Wind Layer: {windLayerVisible ? 'Visible' : 'Hidden'}</div>
            <div className="text-destructive">Check console for DTN API logs</div>
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
            className="w-full"
          >
            {windLayerVisible ? 'Hide Wind' : 'Show Wind'}
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