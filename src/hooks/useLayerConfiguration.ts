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