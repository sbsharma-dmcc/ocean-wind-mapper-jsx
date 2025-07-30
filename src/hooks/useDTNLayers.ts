import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useToast } from '@/hooks/use-toast';
import { dtnOverlays, fetchDTNSourceLayer, createTileURL } from '@/utils/dtnLayerHelpers';
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

  // Create wind barb icon
  const createWindBarbIcon = (speed: number, map: mapboxgl.Map) => {
    const iconName = `wind-barb-${speed}`;
    if (map.hasImage(iconName)) return;

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
  };

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
        
        console.log('DTN source added successfully');

        // Create wind barb icons for different speeds
        if (overlay === 'wind') {
          const speeds = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
          speeds.forEach(speed => createWindBarbIcon(speed, map));
          console.log('Created wind barb icons for speeds:', speeds);
        }

        let beforeId = undefined;

        // Add wind layer
        if (overlay === 'wind') {
          console.log('Adding DTN wind layer with source layer:', sourceLayer);
          
          // Add visible fallback layer first
          map.addLayer({
            id: `${layerId}-debug`,
            type: "circle",
            source: sourceId,
            "source-layer": sourceLayer,
            paint: {
              "circle-radius": 6,
              "circle-color": "#ff0000",
              "circle-opacity": 0.7,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff"
            }
          });
          
          // Add wind barb symbol layer
          map.addLayer({
            id: layerId,
            type: "symbol",
            source: sourceId,
            "source-layer": sourceLayer,
            layout: {
              "icon-image": [
                "case",
                ["has", "windSpeedStyle"], 
                [
                  "case",
                  ["<", ["get", "windSpeedStyle"], 3], "wind-barb-0",
                  ["<", ["get", "windSpeedStyle"], 8], "wind-barb-5", 
                  ["<", ["get", "windSpeedStyle"], 13], "wind-barb-10",
                  ["<", ["get", "windSpeedStyle"], 18], "wind-barb-15",
                  ["<", ["get", "windSpeedStyle"], 23], "wind-barb-20",
                  ["<", ["get", "windSpeedStyle"], 28], "wind-barb-25",
                  ["<", ["get", "windSpeedStyle"], 33], "wind-barb-30",
                  ["<", ["get", "windSpeedStyle"], 38], "wind-barb-35",
                  ["<", ["get", "windSpeedStyle"], 43], "wind-barb-40",
                  ["<", ["get", "windSpeedStyle"], 48], "wind-barb-45",
                  "wind-barb-50"
                ],
                ["has", "value"],
                [
                  "case", 
                  ["<", ["get", "value"], 3], "wind-barb-0",
                  ["<", ["get", "value"], 8], "wind-barb-5",
                  ["<", ["get", "value"], 13], "wind-barb-10",
                  ["<", ["get", "value"], 18], "wind-barb-15", 
                  ["<", ["get", "value"], 23], "wind-barb-20",
                  ["<", ["get", "value"], 28], "wind-barb-25",
                  ["<", ["get", "value"], 33], "wind-barb-30",
                  ["<", ["get", "value"], 38], "wind-barb-35",
                  ["<", ["get", "value"], 43], "wind-barb-40",
                  "wind-barb-45"
                ],
                "wind-barb-10"
              ],
              "icon-rotate": [
                "case",
                ["has", "windDirectionStyle"], ["get", "windDirectionStyle"],
                ["has", "value1"], ["get", "value1"],
                0
              ],
              "icon-size": 0.8,
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
        
        // Enhanced debugging
        setTimeout(() => {
          console.log('=== FINAL DTN Wind Layer Debug Info ===');
          
          // Check if layers exist
          const mainLayer = map.getLayer(layerId);
          const debugLayer = map.getLayer(`${layerId}-debug`);
          const source = map.getSource(sourceId);
          
          console.log('Main layer exists:', !!mainLayer);
          console.log('Debug layer exists:', !!debugLayer);
          console.log('Source exists:', !!source);
          
          if (mainLayer) {
            console.log('Main layer visibility:', map.getLayoutProperty(layerId, 'visibility'));
          }
          
          if (debugLayer) {
            console.log('Debug layer visibility:', map.getLayoutProperty(`${layerId}-debug`, 'visibility'));
          }
          
          // Check for features
          try {
            const features = map.querySourceFeatures(sourceId, {
              sourceLayer: sourceLayer
            });
            console.log(`Found ${features.length} wind features`);
            
            if (features.length > 0) {
              console.log('Sample feature properties:', features[0].properties);
              console.log('Available property keys:', Object.keys(features[0].properties || {}));
              
              // Check for wind data fields
              const props = features[0].properties || {};
              console.log('Wind speed fields:', {
                windSpeedStyle: props.windSpeedStyle,
                value: props.value,
                speed: props.speed
              });
              console.log('Wind direction fields:', {
                windDirectionStyle: props.windDirectionStyle,
                value1: props.value1,
                direction: props.direction
              });
            } else {
              console.log('❌ NO FEATURES FOUND - Tiles may not be loading properly');
            }
          } catch (error) {
            console.error('Error querying features:', error);
          }
          
          // Check if wind barb images are loaded
          const windBarbImages = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map(speed => `wind-barb-${speed}`);
          const loadedImages = windBarbImages.filter(img => map.hasImage(img));
          console.log(`Wind barb images loaded: ${loadedImages.length}/${windBarbImages.length}`, loadedImages);
          
          console.log('=== End Final Debug Info ===');
        }, 4000);

        setActiveOverlays(prev => [...prev, overlay]);
        console.log(`Successfully added ${overlay} layer`);
        
        toast({
          title: `${overlay.charAt(0).toUpperCase() + overlay.slice(1)} Layer`,
          description: `Successfully loaded ${overlay} overlay with debug markers`
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
    const debugLayerId = `${layerId}-debug`;

    // Remove all related layers
    [debugLayerId, layerId, `${layerId}-blur`, `${layerId}-fill`].forEach(id => {
      if (map.getLayer(id)) {
        map.removeLayer(id);
        console.log(`Removed layer: ${id}`);
      }
    });
    
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
      console.log(`Removed source: ${sourceId}`);
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