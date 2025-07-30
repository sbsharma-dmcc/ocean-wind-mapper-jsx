import mapboxgl from 'mapbox-gl';

// Create accurate wind barb SVGs based on meteorological standards
export const createWindBarbIcon = (windSpeedKnots: number): string => {
  const size = 48;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Calm conditions (< 3 knots)
  if (windSpeedKnots < 3) {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${centerX}" cy="${centerY}" r="4" fill="none" stroke="black" stroke-width="2"/>
      </svg>
    `;
  }
  
  let barbElements = '';
  let remainingSpeed = windSpeedKnots;
  let barbY = centerY - 16; // Start position for barbs
  
  // Add 50-knot pennants (triangular flags)
  const pennants = Math.floor(remainingSpeed / 50);
  for (let i = 0; i < pennants; i++) {
    barbElements += `
      <polygon points="${centerX + 2},${barbY} ${centerX + 14},${barbY} ${centerX + 2},${barbY + 10}" 
               fill="black" stroke="black" stroke-width="1"/>
    `;
    barbY += 8;
    remainingSpeed -= 50;
  }
  
  // Add 10-knot barbs (full lines)
  const fullBarbs = Math.floor(remainingSpeed / 10);
  for (let i = 0; i < fullBarbs; i++) {
    barbElements += `
      <line x1="${centerX + 2}" y1="${barbY}" x2="${centerX + 14}" y2="${barbY - 4}" 
            stroke="black" stroke-width="2"/>
    `;
    barbY += 5;
    remainingSpeed -= 10;
  }
  
  // Add 5-knot barbs (half lines)
  if (remainingSpeed >= 5) {
    barbElements += `
      <line x1="${centerX + 2}" y1="${barbY}" x2="${centerX + 8}" y2="${barbY - 2}" 
            stroke="black" stroke-width="2"/>
    `;
  }
  
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- Main shaft -->
      <line x1="${centerX}" y1="${centerY + 18}" x2="${centerX}" y2="${centerY - 18}" 
            stroke="black" stroke-width="2"/>
      <!-- Barbs -->
      ${barbElements}
    </svg>
  `;
};

// Convert SVG to canvas for Mapbox
const svgToCanvas = (svgString: string, size: number = 48): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);
  
  return new Promise<HTMLCanvasElement>((resolve) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.src = url;
  }) as any; // We'll handle this synchronously for now
};

// Mock wind data with various speeds to test different barb types
export const createMockWindLayer = (map: mapboxgl.Map) => {
  const mockWindData: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [
      // Calm
      { type: "Feature", geometry: { type: "Point", coordinates: [83.0, 7.0] }, properties: { windSpeed: 2, windDirection: 0 }},
      // 5 knots (half barb)
      { type: "Feature", geometry: { type: "Point", coordinates: [83.3, 7.2] }, properties: { windSpeed: 5, windDirection: 45 }},
      // 10 knots (full barb)
      { type: "Feature", geometry: { type: "Point", coordinates: [82.8, 6.8] }, properties: { windSpeed: 10, windDirection: 90 }},
      // 15 knots (full + half barb)
      { type: "Feature", geometry: { type: "Point", coordinates: [83.2, 6.5] }, properties: { windSpeed: 15, windDirection: 135 }},
      // 20 knots (two full barbs)
      { type: "Feature", geometry: { type: "Point", coordinates: [84.0, 7.5] }, properties: { windSpeed: 20, windDirection: 180 }},
      // 25 knots (two full + half barb)
      { type: "Feature", geometry: { type: "Point", coordinates: [82.5, 7.3] }, properties: { windSpeed: 25, windDirection: 225 }},
      // 35 knots (three full + half barb)
      { type: "Feature", geometry: { type: "Point", coordinates: [83.8, 6.7] }, properties: { windSpeed: 35, windDirection: 270 }},
      // 55 knots (pennant + full barb)
      { type: "Feature", geometry: { type: "Point", coordinates: [82.9, 6.3] }, properties: { windSpeed: 55, windDirection: 315 }},
    ]
  };

  // Add source
  if (!map.getSource('mock-wind-source')) {
    map.addSource('mock-wind-source', {
      type: 'geojson',
      data: mockWindData
    });
    console.log('Added mock wind data source with various wind speeds');
  }

  // Create wind barb icons for different speeds
  const speeds = [0, 5, 10, 15, 20, 25, 35, 55];
  
  speeds.forEach(speed => {
    const iconName = `wind-barb-${speed}`;
    if (!map.hasImage(iconName)) {
      // Create canvas directly
      const canvas = document.createElement('canvas');
      const size = 48;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      
      // Clear background
      ctx.clearRect(0, 0, size, size);
      
      const centerX = size / 2;
      const centerY = size / 2;
      
      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'black';
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
    }
  });

  console.log('Created wind barb icons for speeds:', speeds);

  // Add layer
  if (!map.getLayer('mock-wind-layer')) {
    map.addLayer({
      id: 'mock-wind-layer',
      type: 'symbol',
      source: 'mock-wind-source',
      layout: {
        'icon-image': [
          'case',
          ['<', ['get', 'windSpeed'], 3], 'wind-barb-0',
          ['<', ['get', 'windSpeed'], 8], 'wind-barb-5',
          ['<', ['get', 'windSpeed'], 13], 'wind-barb-10',
          ['<', ['get', 'windSpeed'], 18], 'wind-barb-15',
          ['<', ['get', 'windSpeed'], 23], 'wind-barb-20',
          ['<', ['get', 'windSpeed'], 30], 'wind-barb-25',
          ['<', ['get', 'windSpeed'], 45], 'wind-barb-35',
          'wind-barb-55'
        ],
        'icon-size': 0.7,
        'icon-rotate': ['get', 'windDirection'],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'icon-rotation-alignment': 'map'
      }
    });
    console.log('Added mock wind layer with proper barb symbols');
  }
};