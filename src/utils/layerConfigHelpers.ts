import mapboxgl from 'mapbox-gl';

export const updateLayerProperties = (map: mapboxgl.Map, layerType: string, properties: Record<string, any>) => {
  if (!map || !map.isStyleLoaded()) return;
  
  const layerId = `dtn-layer-${layerType}`;
  
  if (!map.getLayer(layerId)) return;

  Object.entries(properties).forEach(([property, value]) => {
    try {
      (map as any).setPaintProperty(layerId, property, value);
      console.log(`Updated ${layerType} ${property} to`, value);
    } catch (error) {
      console.warn(`Failed to update ${property}:`, error);
    }
  });
};

export const updateLayoutProperties = (map: mapboxgl.Map, layerType: string, properties: Record<string, any>) => {
  if (!map || !map.isStyleLoaded()) return;
  
  const layerId = `dtn-layer-${layerType}`;
  
  if (!map.getLayer(layerId)) return;

  Object.entries(properties).forEach(([property, value]) => {
    try {
      (map as any).setLayoutProperty(layerId, property, value);
      console.log(`Updated ${layerType} layout ${property} to`, value);
    } catch (error) {
      console.warn(`Failed to update layout ${property}:`, error);
    }
  });
};

export const getSymbolByType = (symbolType: string, customSymbol?: string) => {
  switch (symbolType) {
    case 'arrow':
      return '→';
    case 'triangle':
      return '▲';
    case 'circle':
      return '●';
    case 'square':
      return '■';
    case 'custom':
      return customSymbol || '→';
    default:
      return '→';
  }
};

export const animateSwell = (map: mapboxgl.Map, layerConfigs: any) => {
  if (!map || !map.isStyleLoaded()) return;
  
  const layerId = `dtn-layer-swell`;
  
  if (map.getLayer(layerId)) {
    let offset = 0;
    
    const animate = () => {
      if (!map || !map.getLayer(layerId)) return;
      
      offset += layerConfigs.swell.animationSpeed;
      
      if (layerConfigs.swell.animationEnabled) {
        map.setPaintProperty(layerId, 'fill-translate', [
          Math.sin(offset * 2) * 2,
          Math.cos(offset) * 1
        ]);
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
    console.log('Started swell animation');
  }
};

export const applyLayerConfiguration = (map: mapboxgl.Map, layerType: string, config: any, layerConfigs: any) => {
  if (!map || !map.isStyleLoaded()) return;
  
  if (layerType === 'wind') {
    updateLayerProperties(map, layerType, {
      'text-color': config.textColor,
      'text-opacity': config.textOpacity,
      'text-halo-color': config.haloColor,
      'text-halo-width': config.haloWidth
    });
    
    updateLayoutProperties(map, layerType, {
      'text-size': config.textSize,
      'text-allow-overlap': config.allowOverlap,
      'symbol-spacing': config.symbolSpacing
    });
  }
};