import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wind, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

// DTN Configuration
const TILESET_ID = '7868e6e6-4942-491e-9733-a9b422130f44';
const ACCESS_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpfX21pZW13NGhoTmdvQWQxR3N6ciJ9.eyJodHRwczovL2F1dGguZHRuLmNvbS9hY2NvdW50SWQiOiIyNTY1Mzk5IiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vdmVuZG9ySWQiOiJ1bmtub3duIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vY3VzdG9tZXJJZCI6IjI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9wcm9kdWN0Q29kZSI6IkRUTld4QVBJXzI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9yZXF1ZXN0ZXJJcCI6IjE4LjIxMy4xNzQuMjciLCJodHRwczovL2F1dGguZHRuLmNvbS9ycHMiOiIyNTAiLCJodHRwczovL2F1dGguZHRuLmNvbS90aWVyIjoiRW50ZXJwcmlzZSIsImh0dHBzOi8vYXV0aC5kdG4uY29tL3F1b3RhIjoiMTAwMDAwIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vYXJlYVNpemUiOiIwIiwiaXNzIjoiaHR0cHM6Ly9pZC5hdXRoLmR0bi5jb20vIiwic3ViIjoiRnpGbHZJajNjUFBhejhlc3B5ckhEN0FySnVlY0xOR1BAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbWFwLmFwaS5kdG4uY29tIiwiaWF0IjoxNzUyNDAwODg2LCJleHAiOjE3NTI0ODcyODYsInNjb3BlIjoicmVhZDpjYXRhbG9nLWRlZmF1bHQgd2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJGekZsdklqM2NQUGF6OGVzcHlySEQ3QXJKdWVjTE5HUCIsInBlcm1pc3Npb25zIjpbInJlYWQ6Y2F0YWxvZy1kZWZhdWx0Iiwid2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiXX0.pKtL8VpL7r4vaK_ggpQIhfqex6SDWK6YXTtJQTzYwfq26wS9poUVON2QYiW5ZV4tSVt2X2JStMjxYaogR5vhINssr6tnGj1dkVyWcOaEtfAE6Nl3F8JLqgdHqrUUKTTuptnZoQW7fa2Bb1qyYAaLctPnMSzkSs8CTCqMOe3j3a-niL5J1XwbX9jmOnT1GO2h5YzqzDhdyjSJfsP048W6H8PyM0ciyuCp6I87_B0DkFr9K8nK2IXAMgL_L5fITRUeodEEP4X0weWZ_PbbARNKw62lhvvuEKOpcHFoDzbsae0gdTS_Qeh02PkfLWvqARgyfMBfEAcyq06w8fAzmw9rXA';
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

      // Add DTN wind vector source
      map.current.addSource('dtn-wind', {
        type: 'vector',
        tiles: [
          `https://map.api.dtn.com/v2/tiles/${TILESET_ID}/{z}/{x}/{y}?access_token=${ACCESS_TOKEN}`
        ],
        minzoom: 2,
        maxzoom: 10,
      });

      // Add wind speed color layer
      map.current.addLayer({
        id: 'wind-speed-fill',
        type: 'fill',
        source: 'dtn-wind',
        'source-layer': SOURCE_LAYER,
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'windSpeed'],
            0, '#22C55E',      // Low wind - green
            10, '#EAB308',     // Medium wind - yellow
            20, '#F97316',     // High wind - orange
            30, '#DC2626',     // Extreme wind - red
            50, '#7C2D12'      // Very extreme - dark red
          ],
          'fill-opacity': 0.6
        },
        layout: {
          'visibility': windLayerVisible ? 'visible' : 'none'
        }
      });

      // Add wind direction arrows layer
      map.current.addLayer({
        id: 'wind-arrows',
        type: 'symbol',
        source: 'dtn-wind',
        'source-layer': SOURCE_LAYER,
        layout: {
          'icon-image': 'arrow-15',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['get', 'windSpeed'],
            0, 0.3,
            50, 1.0
          ],
          'icon-rotate': ['get', 'windDirection'],
          'icon-rotation-alignment': 'map',
          'icon-allow-overlap': true,
          'visibility': windLayerVisible ? 'visible' : 'none'
        },
        paint: {
          'icon-opacity': 0.8
        }
      });
    });

    // Handle map errors
    map.current.on('error', (e) => {
      console.error('Map error:', e);
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
    map.current.setLayoutProperty('wind-speed-fill', 'visibility', visibility);
    map.current.setLayoutProperty('wind-arrows', 'visibility', visibility);
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