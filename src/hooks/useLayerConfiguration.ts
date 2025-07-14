import { useState, useEffect } from 'react';

export const useLayerConfiguration = () => {
  const [layerConfigs, setLayerConfigs] = useState({
    wind: {
      textColor: '#ffffff',
      textSize: 16,
      textOpacity: 0.9,
      haloColor: '#000000',
      haloWidth: 1,
      symbolSpacing: 80,
      allowOverlap: true,
      barbStyle: 'full',
      speedUnit: 'knots'
    },
    pressure: {
      contourWidth: 1,
      contourOpacity: 0.8,
      highPressureColor: '#ff0000',
      mediumPressureColor: '#80ff80',
      lowPressureColor: '#800080',
      heatmapRadius: 20,
      heatmapIntensity: 0.6,
      fillOpacity: 0.7
    },
    swell: {
      fillOpacity: 0.9,
      fillOutlineColor: 'transparent',
      animationSpeed: 0.0008,
      animationEnabled: true,
      fillAntialias: true,
      smoothing: true,
      blurRadius: 2,
      edgeFeathering: 1.5,
      gradient: [
        { value: '0m', color: 'rgba(30, 50, 80, 0.3)', opacity: 0.3 },
        { value: '0.5m', color: 'rgba(45, 85, 120, 0.4)', opacity: 0.4 },
        { value: '1m', color: 'rgba(60, 120, 160, 0.5)', opacity: 0.5 },
        { value: '1.5m', color: 'rgba(80, 150, 180, 0.55)', opacity: 0.55 },
        { value: '2m', color: 'rgba(100, 180, 200, 0.6)', opacity: 0.6 },
        { value: '2.5m', color: 'rgba(120, 200, 180, 0.65)', opacity: 0.65 },
        { value: '3m', color: 'rgba(140, 210, 160, 0.7)', opacity: 0.7 },
        { value: '3.5m', color: 'rgba(160, 220, 140, 0.75)', opacity: 0.75 },
        { value: '4m', color: 'rgba(180, 230, 120, 0.8)', opacity: 0.8 },
        { value: '4.5m', color: 'rgba(200, 235, 100, 0.82)', opacity: 0.82 },
        { value: '5m', color: 'rgba(220, 220, 80, 0.84)', opacity: 0.84 },
        { value: '5.5m', color: 'rgba(240, 200, 60, 0.86)', opacity: 0.86 },
        { value: '6m', color: 'rgba(250, 180, 50, 0.88)', opacity: 0.88 },
        { value: '6.5m', color: 'rgba(255, 160, 40, 0.9)', opacity: 0.9 },
        { value: '7m', color: 'rgba(255, 140, 35, 0.9)', opacity: 0.9 },
        { value: '7.5m', color: 'rgba(255, 120, 30, 0.9)', opacity: 0.9 },
        { value: '8m', color: 'rgba(255, 100, 25, 0.9)', opacity: 0.9 },
        { value: '8.5m', color: 'rgba(250, 80, 20, 0.9)', opacity: 0.9 },
        { value: '9m', color: 'rgba(240, 60, 15, 0.9)', opacity: 0.9 },
        { value: '9.5m', color: 'rgba(220, 40, 10, 0.9)', opacity: 0.9 },
        { value: '10m+', color: 'rgba(200, 20, 5, 0.9)', opacity: 0.9 }
      ]
    },
    symbol: {
      textColor: '#ff0000',
      textSize: 16,
      textOpacity: 0.8,
      haloColor: '#000000',
      haloWidth: 1,
      symbolSpacing: 100,
      allowOverlap: true,
      rotationAlignment: 'map',
      symbolType: 'arrow',
      customSymbol: '→'
    }
  });

  // Listen for configuration updates from sidebar
  useEffect(() => {
    const handleConfigUpdate = (event: CustomEvent) => {
      const { layerType, config } = event.detail;
      setLayerConfigs(prev => ({
        ...prev,
        [layerType]: config
      }));
    };

    window.addEventListener('weatherConfigUpdate', handleConfigUpdate);
    return () => {
      window.removeEventListener('weatherConfigUpdate', handleConfigUpdate);
    };
  }, []);

  return {
    layerConfigs,
    setLayerConfigs
  };
};