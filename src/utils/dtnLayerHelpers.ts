import { getDirectDTNToken } from './dtnTokenManager';

/**
 * Configuration object for DTN weather overlay layers
 * Maps overlay names to their corresponding DTN layer IDs and tile set IDs
 * Currently focused on wind data only
 */
export const dtnOverlays = {
  wind: { 
    dtnLayerId: 'fcst-manta-wind-speed-contours',           // DTN's internal layer identifier
    tileSetId: 'b864ff86-22af-41fc-963e-38837d457566'       // Unique identifier for the tile set
  }
};

/**
 * Fetches the source layer name for a DTN layer from the DTN API
 * This is required to properly configure Mapbox vector tile layers
 * 
 * @param layerId - The DTN layer ID to fetch source information for
 * @returns Promise that resolves to the source layer name
 * @throws Error if token is missing or API request fails
 */
export const fetchDTNSourceLayer = async (layerId: string) => {
  try {
    // Get the DTN authentication token
    const token = getDirectDTNToken();
    if (!token) throw new Error('No DTN token available');
    
    console.log(`Fetching source layer for: ${layerId}`);
    
    // Make API request to DTN styles endpoint to get layer metadata
    const response = await fetch(`https://map.api.dtn.com/v2/styles/${layerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,  // Bearer token authentication
        Accept: "application/json",        // Request JSON response
      },
    });

    // Check if request was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch source layer: ${response.status} ${response.statusText}`);
    }

    // Parse JSON response and extract source layer name
    const data = await response.json();
    const sourceLayerName = data[0]?.mapBoxStyle?.layers?.[0]?.["source-layer"];
    console.log(`Source layer found: ${sourceLayerName}`);
    return sourceLayerName;
  } catch (error) {
    console.error('Error fetching DTN source layer:', error);
    throw error;
  }
};

/**
 * Creates a properly formatted tile URL for DTN weather data
 * Constructs the URL with authentication token for accessing DTN tile services
 * 
 * @param dtnLayerId - The DTN layer identifier
 * @param tileSetId - The tile set identifier for the specific layer
 * @returns Formatted URL string for accessing DTN tiles
 * @throws Error if no DTN token is available
 */
export const createTileURL = (dtnLayerId: string, tileSetId: string) => {
  // Get authentication token from token manager
  const token = getDirectDTNToken();
  if (!token) throw new Error('No DTN token available');
  
  // Remove 'Bearer ' prefix from token for URL parameter usage
  const authToken = token.replace('Bearer ', '');
  
  // Return formatted tile URL with placeholders for zoom, x, y coordinates
  // The {z}/{x}/{y} placeholders will be replaced by Mapbox with actual tile coordinates
  return `https://map.api.dtn.com/v2/tiles/${dtnLayerId}/${tileSetId}/{z}/{x}/{y}.pbf?token=${authToken}`;
};