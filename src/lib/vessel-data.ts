export interface Vessel {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
}

export const generateMockVessels = (count: number = 25): Vessel[] => {
  const vessels: Vessel[] = [];
  const vesselTypes = ['Cargo', 'Tanker', 'Container', 'Fishing', 'Passenger', 'Tug'];
  
  // Generate vessels around the Indian Ocean region
  const centerLat = 6.887;
  const centerLng = 83.167;
  const radius = 10; // degrees

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;
    
    const lat = centerLat + (distance * Math.cos(angle));
    const lng = centerLng + (distance * Math.sin(angle));

    vessels.push({
      id: `vessel_${i + 1}`,
      name: `Vessel ${i + 1}`,
      type: vesselTypes[Math.floor(Math.random() * vesselTypes.length)],
      lat,
      lng,
      speed: Math.random() * 20 + 5, // 5-25 knots
      heading: Math.random() * 360
    });
  }

  return vessels;
};