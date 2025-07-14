import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useToast } from '@/hooks/use-toast';
import { dtnOverlays, fetchDTNSourceLayer, createTileURL } from '@/utils/dtnLayerHelpers';
import { applyLayerConfiguration, animateSwell, getSymbolByType } from '@/utils/layerConfigHelpers';

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

        let beforeId = undefined;

        if (overlay === 'pressure') {
          const config = layerConfigs.pressure;
          map.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            "source-layer": sourceLayer,
            paint: {
              "line-color": [
                'interpolate',
                ['linear'],
                ['to-number', ['get', 'value'], 1013],
                980, config.lowPressureColor,
                1000, config.lowPressureColor,
                1013, config.mediumPressureColor,
                1030, config.highPressureColor,
                1050, config.highPressureColor
              ],
              "line-width": [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, config.contourWidth,
                6, config.contourWidth * 1.5,
                10, config.contourWidth * 2,
                14, config.contourWidth * 3
              ],
              "line-opacity": config.contourOpacity
            },
            layout: {
              "visibility": "visible",
              "line-cap": "round",
              "line-join": "round"
            }
          }, beforeId);

        } else if (overlay === 'pressure-gradient') {
          map.addLayer({
            id: layerId,
            type: "heatmap",
            source: sourceId,
            "source-layer": sourceLayer,
            paint: {
              "heatmap-color": [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(128, 0, 128, 0)',
                0.1, 'rgba(128, 0, 128, 0.2)',
                0.2, 'rgba(0, 0, 255, 0.3)',
                0.3, 'rgba(0, 128, 255, 0.4)',
                0.4, 'rgba(0, 255, 255, 0.5)',
                0.5, 'rgba(128, 255, 128, 0.4)',
                0.6, 'rgba(255, 255, 0, 0.5)',
                0.7, 'rgba(255, 128, 0, 0.6)',
                0.8, 'rgba(255, 0, 0, 0.7)',
                1, 'rgba(128, 0, 0, 0.8)'
              ],
              "heatmap-radius": [
                'interpolate',
                ['exponential', 2],
                ['zoom'],
                0, layerConfigs.pressure.heatmapRadius,
                6, layerConfigs.pressure.heatmapRadius * 2,
                10, layerConfigs.pressure.heatmapRadius * 4,
                14, layerConfigs.pressure.heatmapRadius * 6
              ],
              "heatmap-intensity": layerConfigs.pressure.heatmapIntensity,
              "heatmap-opacity": layerConfigs.pressure.fillOpacity
            },
            layout: {
              "visibility": "visible"
            }
          }, beforeId);

        } else if (overlay === 'swell') {
          const colorExpression = [
            'interpolate',
            ['exponential', 1.5],
            ['to-number', ['get', 'value'], 0]
          ] as any;

          layerConfigs.swell.gradient.forEach((item) => {
            const heightValue = parseFloat(item.value.replace('m', '').replace('+', ''));
            colorExpression.push(heightValue, item.color);
          });

          map.addLayer({
            id: layerId,
            type: "fill",
            source: sourceId,
            "source-layer": sourceLayer,
            paint: {
              "fill-color": colorExpression,
              "fill-opacity": layerConfigs.swell.fillOpacity,
              "fill-outline-color": layerConfigs.swell.fillOutlineColor,
              "fill-antialias": true
            },
            layout: {
              "visibility": "visible"
            }
          }, beforeId);
          
          setTimeout(() => animateSwell(map, layerConfigs), 100);
        } else if (overlay === 'wind') {
          map.addLayer({
            id: layerId,
            type: "symbol",
            source: sourceId,
            "source-layer": sourceLayer,
            layout: {
              "text-field": [
                "case",
                ["<", ["to-number", ["get", "value"], 0], 3], "○",
                ["<", ["to-number", ["get", "value"], 0], 8], "│",
                ["<", ["to-number", ["get", "value"], 0], 13], "╸│",
                ["<", ["to-number", ["get", "value"], 0], 18], "━│",
                ["<", ["to-number", ["get", "value"], 0], 23], "━╸│",
                ["<", ["to-number", ["get", "value"], 0], 28], "━━│",
                ["<", ["to-number", ["get", "value"], 0], 33], "━━╸│",
                ["<", ["to-number", ["get", "value"], 0], 38], "━━━│",
                ["<", ["to-number", ["get", "value"], 0], 43], "━━━╸│",
                ["<", ["to-number", ["get", "value"], 0], 48], "━━━━│",
                ["<", ["to-number", ["get", "value"], 0], 53], "━━━━╸│",
                ["<", ["to-number", ["get", "value"], 0], 63], "◤│",
                ["<", ["to-number", ["get", "value"], 0], 68], "◤╸│",
                ["<", ["to-number", ["get", "value"], 0], 73], "◤━│",
                ["<", ["to-number", ["get", "value"], 0], 78], "◤━╸│",
                ["<", ["to-number", ["get", "value"], 0], 83], "◤━━│",
                ["<", ["to-number", ["get", "value"], 0], 88], "◤━━╸│",
                ["<", ["to-number", ["get", "value"], 0], 93], "◤━━━│",
                ["<", ["to-number", ["get", "value"], 0], 98], "◤━━━╸│",
                ["<", ["to-number", ["get", "value"], 0], 103], "◤━━━━│",
                "◤◤│"
              ],
              "text-size": layerConfigs.wind.textSize,
              "text-rotation-alignment": "map",
              "text-rotate": [
                "case",
                ["has", "direction"],
                ["get", "direction"],
                ["has", "value1"], 
                ["get", "value1"],
                0
              ],
              "text-allow-overlap": layerConfigs.wind.allowOverlap,
              "text-ignore-placement": true,
              "symbol-spacing": layerConfigs.wind.symbolSpacing,
              "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
              "text-anchor": "bottom"
            },
            paint: {
              "text-color": layerConfigs.wind.textColor,
              "text-opacity": layerConfigs.wind.textOpacity,
              "text-halo-color": layerConfigs.wind.haloColor,
              "text-halo-width": layerConfigs.wind.haloWidth
            },
          }, beforeId);
        } else if (overlay === 'symbol') {
          const symbolConfig = layerConfigs.symbol;
          const symbolText = getSymbolByType(symbolConfig.symbolType, symbolConfig.customSymbol);
          
          map.addLayer({
            id: layerId,
            type: "symbol",
            source: sourceId,
            "source-layer": sourceLayer,
            layout: {
              "text-field": symbolText,
              "text-size": symbolConfig.textSize,
              "text-rotation-alignment": symbolConfig.rotationAlignment,
              "text-rotate": [
                "case",
                ["has", "direction"],
                ["get", "direction"],
                ["has", "value1"], 
                ["get", "value1"],
                0
              ],
              "text-allow-overlap": symbolConfig.allowOverlap,
              "text-ignore-placement": true,
              "symbol-spacing": symbolConfig.symbolSpacing
            },
            paint: {
              "text-color": symbolConfig.textColor,
              "text-opacity": symbolConfig.textOpacity,
              "text-halo-color": symbolConfig.haloColor,
              "text-halo-width": symbolConfig.haloWidth
            },
          }, beforeId);
        }

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