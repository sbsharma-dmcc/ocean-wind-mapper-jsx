import { useRef, useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useToast } from '@/hooks/use-toast';
import { createVesselMarkers, cleanupVesselMarkers } from '@/utils/vesselMarkers';

mapboxgl.accessToken = "pk.eyJ1IjoiZ2Vvc2VydmUiLCJhIjoiY201Z2J3dXBpMDU2NjJpczRhbmJubWtxMCJ9.6Kw-zTqoQcNdDokBgbI5_Q";

export const useMapbox = (vessels: any[] = []) => {
  const mapContainerRef = useRef(null);
  const mapref = useRef<mapboxgl.Map | null>(null);
  const vesselMarkersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (mapref.current) return;

    console.log("Initializing new map");

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: 'mapbox://styles/geoserve/cmbf0vz6e006g01sdcdl40oi7',
      center: [83.167, 6.887],
      zoom: 4,
      attributionControl: false
    });

    mapref.current = map;

    map.addControl(
      new mapboxgl.NavigationControl(),
      'bottom-right'
    );

    map.on('load', () => {
      setIsMapLoaded(true);
      console.log("Map fully loaded");
      
      toast({
        title: "Map Loaded",
        description: "Map has been successfully initialized"
      });
    });

    map.on('error', (e) => {
      console.error("Map error:", e.error);
      toast({
        title: "Map Error",
        description: "Failed to load the map. Please check your internet connection.",
        variant: "destructive"
      });
    });

    return () => {
      if (mapref.current) {
        cleanupVesselMarkers(vesselMarkersRef);
        mapref.current.remove();
        mapref.current = null;
      }
      setIsMapLoaded(false);
    };
  }, [toast]);

  // Add vessels to map when map is loaded and vessels are available
  useEffect(() => {
    if (!mapref.current || !isMapLoaded || vessels.length === 0) return;

    console.log("Adding vessels to map:", vessels.length);
    createVesselMarkers(mapref.current, vessels, vesselMarkersRef);
  }, [isMapLoaded, vessels]);

  return {
    mapContainerRef,
    mapref,
    isMapLoaded
  };
};