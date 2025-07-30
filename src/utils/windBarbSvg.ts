// Generate SVG wind barbs based on wind speed
export const createWindBarbSVG = (windSpeed: number): string => {
  const size = 40;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Convert wind speed to determine barb type
  const speedKnots = Math.round(windSpeed * 1.94384); // Convert m/s to knots
  
  // Calm conditions (< 3 knots)
  if (speedKnots < 3) {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${centerX}" cy="${centerY}" r="3" fill="black" stroke="black" stroke-width="1"/>
      </svg>
    `;
  }
  
  let barbElements = '';
  let remainingSpeed = speedKnots;
  let barbY = centerY - 12; // Start position for barbs
  
  // Add 50-knot pennants (triangles)
  const pennants = Math.floor(remainingSpeed / 50);
  for (let i = 0; i < pennants; i++) {
    barbElements += `
      <polygon points="${centerX + 2},${barbY} ${centerX + 12},${barbY} ${centerX + 2},${barbY + 8}" 
               fill="black" stroke="black" stroke-width="1"/>
    `;
    barbY += 6;
    remainingSpeed -= 50;
  }
  
  // Add 10-knot barbs (full lines)
  const fullBarbs = Math.floor(remainingSpeed / 10);
  for (let i = 0; i < fullBarbs; i++) {
    barbElements += `
      <line x1="${centerX + 2}" y1="${barbY}" x2="${centerX + 12}" y2="${barbY - 3}" 
            stroke="black" stroke-width="2"/>
    `;
    barbY += 4;
    remainingSpeed -= 10;
  }
  
  // Add 5-knot barbs (half lines)
  if (remainingSpeed >= 5) {
    barbElements += `
      <line x1="${centerX + 2}" y1="${barbY}" x2="${centerX + 7}" y2="${barbY - 1.5}" 
            stroke="black" stroke-width="2"/>
    `;
  }
  
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- Main shaft -->
      <line x1="${centerX}" y1="${centerY + 15}" x2="${centerX}" y2="${centerY - 15}" 
            stroke="black" stroke-width="2"/>
      <!-- Barbs -->
      ${barbElements}
    </svg>
  `;
};

export const svgToDataURL = (svg: string): string => {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Create wind barb images for different speed ranges
export const createWindBarbImages = (map: mapboxgl.Map) => {
  const speeds = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70];
  
  speeds.forEach(speed => {
    const svg = createWindBarbSVG(speed);
    const img = new Image();
    img.onload = () => {
      if (!map.hasImage(`wind-barb-${speed}`)) {
        map.addImage(`wind-barb-${speed}`, img);
      }
    };
    img.src = svgToDataURL(svg);
  });
};