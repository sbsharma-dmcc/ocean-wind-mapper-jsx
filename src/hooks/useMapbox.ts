import { useRef, useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useToast } from '@/hooks/use-toast';
import { createVesselMarkers, cleanupVesselMarkers } from '@/utils/vesselMarkers';

// Set the Mapbox public access token for authentication
// This token allows access to Mapbox's map tiles and services
mapboxgl.accessToken = "pk.eyJ1IjoiZ2Vvc2VydmUiLCJhIjoiY201Z2J3dXBpMDU2NjJpczRhbmJubWtxMCJ9.6Kw-zTqoQcNdDokBgbI5_Q";

/**
 * Custom hook for managing Mapbox map instance and vessel markers
 * Handles map initialization, vessel marker creation, and cleanup
 * 
 * @param vessels - Array of vessel objects to display as markers on the map
 * @returns Object containing map container ref, map instance ref, and loading state
 */
export const useMapbox = (vessels: any[] = []) => {
  // Reference to the DOM element that will contain the map
  const mapContainerRef = useRef(null);
  
  // Reference to the Mapbox map instance
  const mapref = useRef<mapboxgl.Map | null>(null);
  
  // Reference to store vessel markers for cleanup and management
  const vesselMarkersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  
  // State to track if the map has finished loading
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // Hook for displaying toast notifications
  const { toast } = useToast();

  // Effect to initialize the Mapbox map instance
  useEffect(() => {
    // Prevent multiple map initializations
    if (mapref.current) return;

    console.log("Initializing new map");

    // Create new Mapbox map instance
    const map = new mapboxgl.Map({
      container: mapContainerRef.current!, // DOM element to render map in
      style: 'mapbox://styles/geoserve/cmbf0vz6e006g01sdcdl40oi7', // Custom map style
      center: [83.167, 6.887], // Initial map center coordinates [longitude, latitude]
      zoom: 4, // Initial zoom level
      attributionControl: false // Disable default attribution control
    });

    // Store map reference for use in other effects and cleanup
    mapref.current = map;

    // Add navigation controls (zoom in/out, compass, pitch controls)
    map.addControl(
      new mapboxgl.NavigationControl(),
      'bottom-right' // Position the controls in bottom-right corner
    );

    // Event listener for when map finishes loading
    map.on('load', () => {
      setIsMapLoaded(true); // Update loading state
      console.log("Map fully loaded");
      
      // Show success notification
      toast({
        title: "Map Loaded",
        description: "Map has been successfully initialized"
      });
    });

    // Event listener for map errors (network issues, style loading failures, etc.)
    map.on('error', (e) => {
      console.error("Map error:", e.error);
      // Show error notification to user
      toast({
        title: "Map Error",
        description: "Failed to load the map. Please check your internet connection.",
        variant: "destructive"
      });
    });

    // Cleanup function when component unmounts or effect re-runs
    return () => {
      if (mapref.current) {
        // Clean up all vessel markers to prevent memory leaks
        cleanupVesselMarkers(vesselMarkersRef);
        // Remove the map instance and free up resources
        mapref.current.remove();
        mapref.current = null;
      }
      // Reset loading state
      setIsMapLoaded(false);
    };
  }, [toast]); // Re-run effect only if toast function changes

  // Effect to add vessel markers when map is ready and vessels are available
  useEffect(() => {
    // Wait for map to be initialized, loaded, and vessels to be available
    if (!mapref.current || !isMapLoaded || vessels.length === 0) return;

    console.log("Adding vessels to map:", vessels.length);
    // Create and add vessel markers to the map
    createVesselMarkers(mapref.current, vessels, vesselMarkersRef);
  }, [isMapLoaded, vessels]); // Re-run when map loads or vessels change

  // Return the necessary refs and state for map management
  return {
    mapContainerRef, // Ref for the map container DOM element
    mapref,         // Ref for the Mapbox map instance
    isMapLoaded     // Boolean indicating if map has finished loading
  };
};