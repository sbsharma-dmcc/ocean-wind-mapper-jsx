import React from 'react';
import { dtnOverlays } from '@/utils/dtnLayerHelpers';

interface MapLayerControlsProps {
  showLayers: boolean;
  activeOverlays: string[];
  onOverlayClick: (overlay: string) => void;
  onRemoveAllOverlays: () => void;
}

const MapLayerControls: React.FC<MapLayerControlsProps> = ({
  showLayers,
  activeOverlays,
  onOverlayClick,
  onRemoveAllOverlays
}) => {
  if (!showLayers) return null;

  return (
    <div className="absolute top-32 left-4 z-20 bg-white rounded-lg shadow-lg p-4 min-w-[200px] animate-fade-in">
      <h3 className="text-sm font-semibold mb-3">DTN Weather Layers</h3>
      {Object.keys(dtnOverlays).map((overlay) => (
        <div
          key={overlay}
          onClick={() => onOverlayClick(overlay)}
          className={`p-2 m-1 rounded cursor-pointer transition-colors hover-scale ${
            activeOverlays.includes(overlay)
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-black'
          }`}
        >
          {overlay.charAt(0).toUpperCase() + overlay.slice(1).replace('-', ' ')}
          {activeOverlays.includes(overlay) && <span className="ml-2">✓</span>}
        </div>
      ))}
      {activeOverlays.length > 0 && (
        <button
          onClick={onRemoveAllOverlays}
          className="w-full mt-2 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors hover-scale"
        >
          Remove All Layers ({activeOverlays.length})
        </button>
      )}
    </div>
  );
};

export default MapLayerControls;