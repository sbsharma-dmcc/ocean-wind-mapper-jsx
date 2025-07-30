import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useToast } from '@/hooks/use-toast';
import { dtnOverlays, fetchDTNSourceLayer, createTileURL } from '@/utils/dtnLayerHelpers';
import { applyLayerConfiguration } from '@/utils/layerConfigHelpers';

export const useDTNLayers = (map: mapboxgl.Map | null, layerConfigs: any, activeLayers?: Record<string, boolean>) => {
  const [activeOverlays, setActiveOverlays] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!activeLayers || !map?.isStyleLoaded()) return;

    Object.entries(activeLayers).forEach(([layerType, enabled]) => {
      if (enabled && layerType in dtnOverlays && !activeOverlays.includes(layerType)) {
        handleOverlayClick(layerType);
      } else if (!enabled && activeOverlays.includes(layerType)) {
        removeOverlay(layerType);
      }
    });
  }, [activeLayers, map?.isStyleLoaded()]);

  // Listen for configuration updates
  useEffect(() => {
    const handleConfigUpdate = (event: CustomEvent) => {
      const { layerType, config } = event.detail;
      if (map) {
        applyLayerConfiguration(map, layerType, config, layerConfigs);
      }
    };

    window.addEventListener('weatherConfigUpdate', handleConfigUpdate);
    return () => {
      window.removeEventListener('weatherConfigUpdate', handleConfigUpdate);
    };
  }, [map, layerConfigs]);

  const handleOverlayClick = async (overlay: string) => {
    console.log(`Attempting to add overlay: ${overlay}`);
    
    if (!map || !map.isStyleLoaded()) {
      console.warn("Map style not yet loaded");
      toast({
        title: "Map Loading",
        description: "Please wait for the map to fully load before adding layers",
        variant: "destructive"
      });
      return;
    }

    if (activeOverlays.includes(overlay)) {
      console.log(`Removing overlay: ${overlay}`);
      removeOverlay(overlay);
      return;
    }

    const { dtnLayerId, tileSetId } = dtnOverlays[overlay];
    const sourceId = `dtn-source-${overlay}`;
    const layerId = `dtn-layer-${overlay}`;

    try {
      console.log(`Adding overlay details:`, { overlay, dtnLayerId, tileSetId, sourceId, layerId });
      
      const sourceLayer = await fetchDTNSourceLayer(dtnLayerId);
      const tileURL = createTileURL(dtnLayerId, tileSetId);
      console.log(`Tile URL: ${tileURL}`);
      
      if (!map.getSource(sourceId)) {
        console.log(`Adding source: ${sourceId}`);
        map.addSource(sourceId, {
          type: "vector",
          tiles: [tileURL],
          minzoom: 0,
          maxzoom: 14,
        });

        // Add wind barbs sprite if needed
        if (overlay === 'wind') {
          // Load the wind barbs sprite from DTN
          const spriteUrl = "https://map.api.dtn.com/static/sprite/wind-barbs";
          map.loadImage(`${spriteUrl}.png`, (error, image) => {
            if (error) {
              console.warn('Could not load wind barbs sprite, falling back to text symbols');
            } else if (image) {
              map.addImage('wind-barbs-sprite', image);
            }
          });
        }

        let beforeId = undefined;

        // Only handle wind layer
        if (overlay === 'wind') {
          map.addLayer({
            id: layerId,
            type: "symbol",
            source: sourceId,
            "source-layer": sourceLayer,
            layout: {
              "icon-image": [
                "case",
                [
                  "<",
                  [
                    "coalesce",
                    ["get", "windSpeedStyle"],
                    ["get", "value"]
                  ],
                  2.5
                ],
                "wind-arrow-calm-00",
                [
                  "case",
                  [
                    "==",
                    [
                      "coalesce",
                      ["get", "isNorthernHemisphereStyle"],
                      ["get", "isNorth"]
                    ],
                    true
                  ],
                  [
                    "case",
                    [
                      "<",
                      [
                        "coalesce",
                        ["get", "windSpeedStyle"],
                        ["get", "value"]
                      ],
                      47.5
                    ],
                    [
                      "concat",
                      "wind-arrow-nh-0",
                      [
                        "ceil",
                        [
                          "/",
                          [
                            "-",
                            [
                              "coalesce",
                              ["get", "windSpeedStyle"],
                              ["get", "value"]
                            ],
                            2.49999
                          ],
                          5
                        ]
                      ]
                    ],
                    [
                      "concat",
                      "wind-arrow-nh-",
                      [
                        "ceil",
                        [
                          "/",
                          [
                            "-",
                            [
                              "coalesce",
                              ["get", "windSpeedStyle"],
                              ["get", "value"]
                            ],
                            2.49999
                          ],
                          5
                        ]
                      ]
                    ]
                  ],
                  [
                    "case",
                    [
                      "<",
                      [
                        "coalesce",
                        ["get", "windSpeedStyle"],
                        ["get", "value"]
                      ],
                      47.5
                    ],
                    [
                      "concat",
                      "wind-arrow-sh-0",
                      [
                        "ceil",
                        [
                          "/",
                          [
                            "-",
                            [
                              "coalesce",
                              ["get", "windSpeedStyle"],
                              ["get", "value"]
                            ],
                            2.49999
                          ],
                          5
                        ]
                      ]
                    ],
                    [
                      "concat",
                      "wind-arrow-sh-",
                      [
                        "ceil",
                        [
                          "/",
                          [
                            "-",
                            [
                              "coalesce",
                              ["get", "windSpeedStyle"],
                              ["get", "value"]
                            ],
                            2.49999
                          ],
                          5
                        ]
                      ]
                    ]
                  ]
                ]
              ],
              "icon-rotate": [
                "case",
                [
                  "==",
                  [
                    "coalesce",
                    ["get", "isNorthernHemisphereStyle"],
                    ["get", "isNorth"]
                  ],
                  true
                ],
                [
                  "+",
                  [
                    "coalesce",
                    ["get", "windDirectionStyle"],
                    ["get", "value1"]
                  ],
                  90
                ],
                [
                  "+",
                  [
                    "coalesce",
                    ["get", "windDirectionStyle"],
                    ["get", "value1"]
                  ],
                  270
                ]
              ],
              "icon-size": 0.35,
              "icon-allow-overlap": false
            }
          }, beforeId);
        }

        setActiveOverlays(prev => [...prev, overlay]);
        console.log(`Successfully added ${overlay} layer`);
        
        toast({
          title: `${overlay.charAt(0).toUpperCase() + overlay.slice(1)} Layer`,
          description: `Successfully loaded ${overlay} overlay`
        });
      } else {
        console.log(`Layer "${overlay}" already exists`);
        toast({
          title: "Layer Already Active",
          description: `${overlay} layer is already active on the map`
        });
      }
    } catch (error: any) {
      console.error(`Error adding ${overlay} layer:`, error);
      
      toast({
        title: "Layer Error",
        description: `Failed to add ${overlay} layer. Please check the token and try again.`,
        variant: "destructive"
      });
    }
  };

  const removeOverlay = (overlay: string) => {
    if (!map || !map.isStyleLoaded()) return;

    const sourceId = `dtn-source-${overlay}`;
    const layerId = `dtn-layer-${overlay}`;
    const blurLayerId = `${layerId}-blur`;
    const fillLayerId = `${layerId}-fill`;

    // Remove all related layers
    if (map.getLayer(fillLayerId)) {
      map.removeLayer(fillLayerId);
    }
    if (map.getLayer(blurLayerId)) {
      map.removeLayer(blurLayerId);
    }
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }

    setActiveOverlays(prev => prev.filter(item => item !== overlay));
  };

  const removeAllOverlays = () => {
    activeOverlays.forEach(overlay => removeOverlay(overlay));
    setActiveOverlays([]);
    
    toast({
      title: "All Layers Removed",
      description: "All weather layers have been removed from the map"
    });
  };

  return {
    activeOverlays,
    handleOverlayClick,
    removeOverlay,
    removeAllOverlays
  };
};