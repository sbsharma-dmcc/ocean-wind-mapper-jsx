import mapboxgl from 'mapbox-gl';

export const createVesselMarkers = (map: mapboxgl.Map, vessels: any[], markersRef: React.MutableRefObject<{ [key: string]: mapboxgl.Marker }>) => {
  // Clean up existing markers
  cleanupVesselMarkers(markersRef);

  vessels.forEach((vessel) => {
    if (vessel.lat && vessel.lng) {
      const marker = new mapboxgl.Marker({
        color: '#3b82f6'
      })
        .setLngLat([vessel.lng, vessel.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div>
                <h3>${vessel.name || 'Unknown Vessel'}</h3>
                <p>Type: ${vessel.type || 'Unknown'}</p>
                <p>Speed: ${vessel.speed || 0} knots</p>
              </div>
            `)
        )
        .addTo(map);

      markersRef.current[vessel.id] = marker;
    }
  });
};

export const cleanupVesselMarkers = (markersRef: React.MutableRefObject<{ [key: string]: mapboxgl.Marker }>) => {
  Object.values(markersRef.current).forEach(marker => {
    marker.remove();
  });
  markersRef.current = {};
};