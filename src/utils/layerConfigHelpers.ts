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
  
  if (layerType === 'pressure') {
    updateLayerProperties(map, layerType, {
      'line-width': config.contourWidth || 1,
      'line-opacity': config.contourOpacity || 0.8,
      'line-color': [
        'interpolate',
        ['linear'],
        ['to-number', ['get', 'value'], 1013],
        980, config.lowPressureColor,
        1000, config.lowPressureColor,
        1013, config.mediumPressureColor,
        1030, config.highPressureColor,
        1050, config.highPressureColor
      ]
    });
  } else if (layerType === 'wind') {
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
  } else if (layerType === 'swell') {
    const colorExpression: any[] = [
      'interpolate',
      ['exponential', 1.5],
      ['to-number', ['get', 'value'], 0]
    ];

    layerConfigs.swell.gradient.forEach((item: any) => {
      const heightValue = parseFloat(item.value.replace('m', '').replace('+', ''));
      colorExpression.push(heightValue, item.color);
    });

    updateLayerProperties(map, layerType, {
      'fill-color': colorExpression,
      'fill-opacity': config.fillOpacity,
      'fill-outline-color': config.fillOutlineColor,
      'fill-antialias': config.fillAntialias
    });
  } else if (layerType === 'symbol') {
    const symbolText = getSymbolByType(config.symbolType, config.customSymbol);
    
    updateLayerProperties(map, layerType, {
      'text-color': config.textColor,
      'text-opacity': config.textOpacity,
      'text-halo-color': config.haloColor,
      'text-halo-width': config.haloWidth
    });
    
    updateLayoutProperties(map, layerType, {
      'text-size': config.textSize,
      'text-allow-overlap': config.allowOverlap,
      'symbol-spacing': config.symbolSpacing,
      'text-rotation-alignment': config.rotationAlignment,
      'text-field': symbolText
    });
  }
};