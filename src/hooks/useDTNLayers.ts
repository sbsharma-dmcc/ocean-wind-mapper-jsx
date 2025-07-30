import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useToast } from '@/hooks/use-toast';
import { dtnOverlays, fetchDTNSourceLayer, createTileURL, createDTNTransformRequest } from '@/utils/dtnLayerHelpers';
import { applyLayerConfiguration } from '@/utils/layerConfigHelpers';
import { createMockWindLayer } from '@/utils/mockWindData';

export const useDTNLayers = (map: mapboxgl.Map | null, layerConfigs: any, activeLayers?: Record<string, boolean>) => {
  const [activeOverlays, setActiveOverlays] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!activeLayers || !map?.isStyleLoaded()) return;

    Object.entries(activeLayers).forEach(([layerType, enabled]) => {
      if (enabled && layerType in dtnOverlays && !activeOverlays.includes(layerType)) {
        handleOverlayClick(layerType);
      } else if (!enabled && activeOverlays.includes(layerType)) {
        removeOverlay(layerType);
      }
    });
  }, [activeLayers, map?.isStyleLoaded()]);

  // Listen for configuration updates
  useEffect(() => {
    const handleConfigUpdate = (event: CustomEvent) => {
      const { layerType, config } = event.detail;
      if (map) {
        applyLayerConfiguration(map, layerType, config, layerConfigs);
      }
    };

    window.addEventListener('weatherConfigUpdate', handleConfigUpdate);
    return () => {
      window.removeEventListener('weatherConfigUpdate', handleConfigUpdate);
    };
  }, [map, layerConfigs]);

  const handleOverlayClick = async (overlay: string) => {
    console.log(`Attempting to add overlay: ${overlay}`);
    
    if (!map || !map.isStyleLoaded()) {
      console.warn("Map style not yet loaded");
      toast({
        title: "Map Loading",
        description: "Please wait for the map to fully load before adding layers",
        variant: "destructive"
      });
      return;
    }

    if (activeOverlays.includes(overlay)) {
      console.log(`Removing overlay: ${overlay}`);
      removeOverlay(overlay);
      return;
    }

    const { dtnLayerId, tileSetId } = dtnOverlays[overlay];
    const sourceId = `dtn-source-${overlay}`;
    const layerId = `dtn-layer-${overlay}`;

    try {
      console.log(`Adding overlay details:`, { overlay, dtnLayerId, tileSetId, sourceId, layerId });
      
      const sourceLayer = await fetchDTNSourceLayer(dtnLayerId);
      const tileURL = createTileURL(dtnLayerId, tileSetId);
      console.log(`Tile URL: ${tileURL}`);
      console.log(`Source layer: ${sourceLayer}`);
      
      if (!map.getSource(sourceId)) {
        console.log(`Adding source: ${sourceId}`);
        map.addSource(sourceId, {
          type: "vector",
          tiles: [tileURL],
          minzoom: 0,
          maxzoom: 14,
        });

        // Set transform request for DTN authentication
        if (!(map as any)._dtnTransformSet) {
          (map as any).setTransformRequest(createDTNTransformRequest());
          (map as any)._dtnTransformSet = true;
        }

        // Create wind barb icons for DTN data
        if (overlay === 'wind') {
          const speeds = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70];
          
          speeds.forEach(speed => {
            const iconName = `wind-barb-${speed}`;
            if (!map.hasImage(iconName)) {
              // Create canvas for wind barb
              const canvas = document.createElement('canvas');
              const size = 48;
              canvas.width = size;
              canvas.height = size;
              const ctx = canvas.getContext('2d')!;
              
              ctx.clearRect(0, 0, size, size);
              const centerX = size / 2;
              const centerY = size / 2;
              
              ctx.strokeStyle = '#0066cc';
              ctx.fillStyle = '#0066cc';
              ctx.lineWidth = 2;
              
              if (speed < 3) {
                // Calm - circle
                ctx.beginPath();
                ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
                ctx.stroke();
              } else {
                // Main shaft
                ctx.beginPath();
                ctx.moveTo(centerX, centerY + 18);
                ctx.lineTo(centerX, centerY - 18);
                ctx.stroke();
                
                let barbY = centerY - 16;
                let remainingSpeed = speed;
                
                // 50-knot pennants
                const pennants = Math.floor(remainingSpeed / 50);
                for (let i = 0; i < pennants; i++) {
                  ctx.beginPath();
                  ctx.moveTo(centerX + 2, barbY);
                  ctx.lineTo(centerX + 14, barbY);
                  ctx.lineTo(centerX + 2, barbY + 10);
                  ctx.closePath();
                  ctx.fill();
                  barbY += 8;
                  remainingSpeed -= 50;
                }
                
                // 10-knot barbs
                const fullBarbs = Math.floor(remainingSpeed / 10);
                for (let i = 0; i < fullBarbs; i++) {
                  ctx.beginPath();
                  ctx.moveTo(centerX + 2, barbY);
                  ctx.lineTo(centerX + 14, barbY - 4);
                  ctx.stroke();
                  barbY += 5;
                  remainingSpeed -= 10;
                }
                
                // 5-knot barbs
                if (remainingSpeed >= 5) {
                  ctx.beginPath();
                  ctx.moveTo(centerX + 2, barbY);
                  ctx.lineTo(centerX + 8, barbY - 2);
                  ctx.stroke();
                }
              }
              
              const imageData = ctx.getImageData(0, 0, size, size);
              map.addImage(iconName, {
                width: size,
                height: size,
                data: new Uint8Array(imageData.data.buffer)
              });
            }
          });
          
          console.log('Created DTN wind barb icons');
        }

        let beforeId = undefined;

        // Add DTN wind layer with proper wind barbs
        if (overlay === 'wind') {
          console.log('Adding DTN wind layer with source layer:', sourceLayer);
          
          map.addLayer({
            id: layerId,
            type: "symbol",
            source: sourceId,
            "source-layer": sourceLayer,
            layout: {
              "icon-image": [
                "case",
                ["<", ["coalesce", ["get", "windSpeedStyle"], ["get", "value"]], 3],
                "wind-barb-0",
                ["<", ["coalesce", ["get", "windSpeedStyle"], ["get", "value"]], 8],
                "wind-barb-5", 
                ["<", ["coalesce", ["get", "windSpeedStyle"], ["get", "value"]], 13],
                "wind-barb-10",
                ["<", ["coalesce", ["get", "windSpeedStyle"], ["get", "value"]], 18],
                "wind-barb-15",
                ["<", ["coalesce", ["get", "windSpeedStyle"], ["get", "value"]], 23],
                "wind-barb-20",
                ["<", ["coalesce", ["get", "windSpeedStyle"], ["get", "value"]], 28],
                "wind-barb-25",
                ["<", ["coalesce", ["get", "windSpeedStyle"], ["get", "value"]], 33],
                "wind-barb-30",
                ["<", ["coalesce", ["get", "windSpeedStyle"], ["get", "value"]], 38],
                "wind-barb-35",
                ["<", ["coalesce", ["get", "windSpeedStyle"], ["get", "value"]], 43],
                "wind-barb-40",
                ["<", ["coalesce", ["get", "windSpeedStyle"], ["get", "value"]], 48],
                "wind-barb-45",
                ["<", ["coalesce", ["get", "windSpeedStyle"], ["get", "value"]], 53],
                "wind-barb-50",
                ["<", ["coalesce", ["get", "windSpeedStyle"], ["get", "value"]], 58],
                "wind-barb-55",
                ["<", ["coalesce", ["get", "windSpeedStyle"], ["get", "value"]], 63],
                "wind-barb-60",
                ["<", ["coalesce", ["get", "windSpeedStyle"], ["get", "value"]], 68],
                "wind-barb-65",
                "wind-barb-70"
              ],
              "icon-rotate": ["coalesce", ["get", "windDirectionStyle"], ["get", "value1"]],
              "icon-size": 0.6,
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
              "icon-rotation-alignment": "map"
            },
            paint: {
              "icon-opacity": 1
            }
          }, beforeId);
          
          console.log('DTN wind layer added successfully');
        }

        // Debug: Check if layer was added and log any features
        setTimeout(() => {
          const features = map.querySourceFeatures(sourceId, {
            sourceLayer: sourceLayer
          });
          console.log(`Found ${features.length} features in wind layer`);
          if (features.length > 0) {
            console.log('Sample feature:', features[0]);
          }
        }, 2000);

        setActiveOverlays(prev => [...prev, overlay]);
        console.log(`Successfully added ${overlay} layer`);
        
        toast({
          title: `${overlay.charAt(0).toUpperCase() + overlay.slice(1)} Layer`,
          description: `Successfully loaded ${overlay} overlay`
        });
      } else {
        console.log(`Layer "${overlay}" already exists`);
        toast({
          title: "Layer Already Active",
          description: `${overlay} layer is already active on the map`
        });
      }
    } catch (error: any) {
      console.error(`Error adding ${overlay} layer:`, error);
      
      toast({
        title: "Layer Error",
        description: `Failed to add ${overlay} layer. Please check the token and try again.`,
        variant: "destructive"
      });
    }
  };

  const removeOverlay = (overlay: string) => {
    if (!map || !map.isStyleLoaded()) return;

    const sourceId = `dtn-source-${overlay}`;
    const layerId = `dtn-layer-${overlay}`;
    const blurLayerId = `${layerId}-blur`;
    const fillLayerId = `${layerId}-fill`;

    // Remove all related layers
    if (map.getLayer(fillLayerId)) {
      map.removeLayer(fillLayerId);
    }
    if (map.getLayer(blurLayerId)) {
      map.removeLayer(blurLayerId);
    }
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }

    setActiveOverlays(prev => prev.filter(item => item !== overlay));
  };

  const removeAllOverlays = () => {
    activeOverlays.forEach(overlay => removeOverlay(overlay));
    setActiveOverlays([]);
    
    toast({
      title: "All Layers Removed",
      description: "All weather layers have been removed from the map"
    });
  };

  return {
    activeOverlays,
    handleOverlayClick,
    removeOverlay,
    removeAllOverlays
  };
};