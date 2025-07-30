import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useToast } from '@/hooks/use-toast';
import { dtnOverlays, fetchDTNSourceLayer, createTileURL, createDTNTransformRequest } from '@/utils/dtnLayerHelpers';
import { createWindBarbImages } from '@/utils/windBarbSvg';
import { applyLayerConfiguration } from '@/utils/layerConfigHelpers';

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

        // Create simple wind direction icons
        if (overlay === 'wind') {
          // Create a simple arrow icon for wind direction
          const canvas = document.createElement('canvas');
          canvas.width = 32;
          canvas.height = 32;
          const ctx = canvas.getContext('2d')!;
          
          // Draw arrow pointing up
          ctx.fillStyle = '#0066cc';
          ctx.strokeStyle = '#0066cc';
          ctx.lineWidth = 2;
          
          ctx.beginPath();
          ctx.moveTo(16, 4);
          ctx.lineTo(12, 12);
          ctx.lineTo(16, 10);
          ctx.lineTo(20, 12);
          ctx.closePath();
          ctx.fill();
          
          // Draw shaft
          ctx.fillRect(14, 10, 4, 18);
          
          if (!map.hasImage('wind-arrow')) {
            const imageData = ctx.getImageData(0, 0, 32, 32);
            map.addImage('wind-arrow', {
              width: 32,
              height: 32,
              data: new Uint8Array(imageData.data.buffer)
            });
          }
          
          console.log('Added wind arrow icon to map');
        }

        let beforeId = undefined;

        // Add wind layer with simple arrow icons
        if (overlay === 'wind') {
          console.log('Adding wind layer with source layer:', sourceLayer);
          
          map.addLayer({
            id: layerId,
            type: "symbol",
            source: sourceId,
            "source-layer": sourceLayer,
            layout: {
              "icon-image": "wind-arrow",
              "icon-rotate": ["get", "windDirectionStyle"],
              "icon-size": 0.8,
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
              "symbol-placement": "point",
              "icon-rotation-alignment": "map"
            },
            paint: {
              "icon-opacity": 1
            }
          }, beforeId);
          
          console.log('Wind layer added successfully');
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