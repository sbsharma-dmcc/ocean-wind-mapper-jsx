import { getDirectDTNToken } from './dtnTokenManager';

export const dtnOverlays = {
  symbol: { dtnLayerId: 'fcst-manta-wind-symbol-grid', tileSetId: 'dd44281e-db07-41a1-a329-bedc225bb575' },
  wind: { dtnLayerId: 'fcst-manta-wind-speed-contours', tileSetId: 'b864ff86-22af-41fc-963e-38837d457566' },
  swell: { dtnLayerId: 'fcst-sea-wave-height-swell-waves-contours', tileSetId: 'd3f83398-2e88-4c2b-a82f-c10db6891bb3' },
  pressure: { dtnLayerId: 'fcst-manta-mean-sea-level-pressure-isolines', tileSetId: '2703fb6d-0ace-43a3-aca1-76588e3ac9a8' },
  'pressure-gradient': { dtnLayerId: 'fcst-manta-mean-sea-level-pressure-gradient', tileSetId: '3fca4d12-8e9a-4c15-9876-1a2b3c4d5e6f' },
};

export const fetchDTNSourceLayer = async (layerId: string) => {
  try {
    const token = getDirectDTNToken();
    if (!token) throw new Error('No DTN token available');
    
    console.log(`Fetching source layer for: ${layerId}`);
    
    const response = await fetch(`https://map.api.dtn.com/v2/styles/${layerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch source layer: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const sourceLayerName = data[0]?.mapBoxStyle?.layers?.[0]?.["source-layer"];
    console.log(`Source layer found: ${sourceLayerName}`);
    return sourceLayerName;
  } catch (error) {
    console.error('Error fetching DTN source layer:', error);
    throw error;
  }
};

export const createTileURL = (dtnLayerId: string, tileSetId: string) => {
  const token = getDirectDTNToken();
  if (!token) throw new Error('No DTN token available');
  
  const authToken = token.replace('Bearer ', '');
  return `https://map.api.dtn.com/v2/tiles/${dtnLayerId}/${tileSetId}/{z}/{x}/{y}.pbf?token=${authToken}`;
};