import { getDirectDTNToken } from './dtnTokenManager';

export const dtnOverlays = {
  wind: { dtnLayerId: 'fcst-manta-wind-symbol-grid', tileSetId: 'b864ff86-22af-41fc-963e-38837d457566' }
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
  return `https://map.api.dtn.com/v2/tiles/${dtnLayerId}/${tileSetId}/{z}/{x}/{y}.pbf`;
};

export const createDTNTransformRequest = () => {
  return (url: string, resourceType: string) => {
    if (url.includes('map.api.dtn.com')) {
      const token = getDirectDTNToken();
      if (token) {
        return {
          url: url,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
      }
    }
    return { url };
  };
};