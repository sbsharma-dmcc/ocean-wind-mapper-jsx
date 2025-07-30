import mapboxgl from 'mapbox-gl';
export const createMockWindLayer = (map: mapboxgl.Map) => {
  // Create mock wind data in GeoJSON format
  const mockWindData: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [83.0, 7.0] // Around Sri Lanka
        },
        properties: {
          windSpeed: 15,
          windDirection: 45
        }
      },
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [83.5, 7.2]
        },
        properties: {
          windSpeed: 20,
          windDirection: 90
        }
      },
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [82.8, 6.8]
        },
        properties: {
          windSpeed: 12,
          windDirection: 180
        }
      },
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [83.2, 6.5]
        },
        properties: {
          windSpeed: 25,
          windDirection: 270
        }
      },
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [84.0, 7.5]
        },
        properties: {
          windSpeed: 8,
          windDirection: 315
        }
      }
    ]
  };

  // Add mock source
  if (!map.getSource('mock-wind-source')) {
    map.addSource('mock-wind-source', {
      type: 'geojson',
      data: mockWindData
    });
    console.log('Added mock wind data source');
  }

  // Create wind barb icon
  const canvas = document.createElement('canvas');
  canvas.width = 40;
  canvas.height = 40;
  const ctx = canvas.getContext('2d')!;
  
  // Draw wind barb
  ctx.strokeStyle = '#0066cc';
  ctx.fillStyle = '#0066cc';
  ctx.lineWidth = 2;
  
  // Main shaft
  ctx.beginPath();
  ctx.moveTo(20, 5);
  ctx.lineTo(20, 35);
  ctx.stroke();
  
  // Wind speed barbs (example for 15 knots)
  // 10 knot barb
  ctx.beginPath();
  ctx.moveTo(20, 10);
  ctx.lineTo(30, 7);
  ctx.stroke();
  
  // 5 knot barb
  ctx.beginPath();
  ctx.moveTo(20, 15);
  ctx.lineTo(25, 13);
  ctx.stroke();
  
  if (!map.hasImage('wind-barb-icon')) {
    const imageData = ctx.getImageData(0, 0, 40, 40);
    map.addImage('wind-barb-icon', {
      width: 40,
      height: 40,
      data: new Uint8Array(imageData.data.buffer)
    });
    console.log('Added wind barb icon to map');
  }

  // Add mock wind layer
  if (!map.getLayer('mock-wind-layer')) {
    map.addLayer({
      id: 'mock-wind-layer',
      type: 'symbol',
      source: 'mock-wind-source',
      layout: {
        'icon-image': 'wind-barb-icon',
        'icon-size': 0.8,
        'icon-rotate': ['get', 'windDirection'],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true
      }
    });
    console.log('Added mock wind layer');
  }
};