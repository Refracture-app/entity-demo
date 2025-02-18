export const BLEND_MODES = [
    'normal', 
    'multiply', 
    'screen', 
    'overlay', 
    'darken', 
    'lighten', 
    'color-dodge', 
    'color-burn'
  ];
  
  export const APP_CONFIG = {
    BASE_IMAGE_PATH: '/assets/',
    ASSETS: {
      LAYER_1: 'Layer1.webp',
      LAYER_2: 'Layer2.webp',
      ENTITY_LOGO: 'Entity.webp'
    }
  };
  
  export const DEFAULT_LAYER_CONFIG = {
    1: {
      speed: 0.05,
      size: 1.6,
      xaxis: 1440,
      yaxis: 1380,
      drift: 0.3,
      direction: -1,
      angle: -194.21,
      blendMode: 'color-dodge',
      driftSpeed: 0.3
    },
    2: {
      speed: 0.035,
      size: 1.6,
      xaxis: 2210,
      yaxis: 1920,
      drift: 0.3,
      direction: 1,
      angle: 63.385,
      blendMode: 'normal',
      driftSpeed: 0.2
    }
  };