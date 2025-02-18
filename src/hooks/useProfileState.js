import { useState, useCallback } from 'react';
import { DEFAULT_LAYER_CONFIG } from '../constants';

export const useProfileState = () => {
  const [layerConfigs, setLayerConfigs] = useState(() => {
    // Create a deep copy of the default config to ensure complete isolation
    return JSON.parse(JSON.stringify(DEFAULT_LAYER_CONFIG));
  });

  const updateLayerConfig = useCallback((layerId, key, value) => {
    setLayerConfigs(prevConfigs => {
      const newConfigs = { ...prevConfigs };
      newConfigs[layerId] = { ...newConfigs[layerId] };

      // Special handling for drift updates
      if (key === 'drift') {
        newConfigs[layerId] = {
          ...newConfigs[layerId],
          [key]: value,
          driftState: value > 0 ? {
            startTime: Date.now(),
            enabled: true,
            x: 0,
            y: 0
          } : { x: 0, y: 0 }
        };
      } else {
        newConfigs[layerId][key] = value;
      }

      return newConfigs;
    });
  }, []);

  return {
    layerConfigs,
    updateLayerConfig
  };
};