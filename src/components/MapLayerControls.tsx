import React from 'react';
import { dtnOverlays } from '@/utils/dtnLayerHelpers';

/**
 * Props interface for MapLayerControls component
 */
interface MapLayerControlsProps {
  showLayers: boolean;                           // Controls visibility of the layer panel
  activeOverlays: string[];                      // Array of currently active overlay names
  onOverlayClick: (overlay: string) => void;     // Callback when user clicks an overlay button
  onRemoveAllOverlays: () => void;               // Callback to remove all active overlays
}

/**
 * MapLayerControls component renders a control panel for managing wind layers
 * Allows users to toggle different DTN wind overlays on/off
 */
const MapLayerControls: React.FC<MapLayerControlsProps> = ({
  showLayers,          // Whether to show the control panel
  activeOverlays,      // List of currently active overlays
  onOverlayClick,      // Function to handle overlay toggle clicks
  onRemoveAllOverlays  // Function to remove all overlays at once
}) => {
  // Don't render anything if panel should be hidden
  if (!showLayers) return null;

  return (
    <div className="absolute top-32 left-4 z-20 bg-white rounded-lg shadow-lg p-4 min-w-[200px] animate-fade-in">
      {/* Panel header */}
      <h3 className="text-sm font-semibold mb-3">Wind Layer</h3>
      
      {/* Render a button for each available DTN overlay */}
      {Object.keys(dtnOverlays).map((overlay) => (
        <div
          key={overlay}
          onClick={() => onOverlayClick(overlay)} // Toggle overlay when clicked
          className={`p-2 m-1 rounded cursor-pointer transition-colors hover-scale ${
            activeOverlays.includes(overlay)
              ? 'bg-blue-500 text-white'         // Active state styling
              : 'bg-gray-100 hover:bg-gray-200 text-black' // Inactive state styling
          }`}
        >
          {/* Format overlay name for display (capitalize first letter, replace hyphens with spaces) */}
          {overlay.charAt(0).toUpperCase() + overlay.slice(1).replace('-', ' ')}
          {/* Show checkmark for active overlays */}
          {activeOverlays.includes(overlay) && <span className="ml-2">✓</span>}
        </div>
      ))}
      
      {/* Show "Remove All" button only when there are active overlays */}
      {activeOverlays.length > 0 && (
        <button
          onClick={onRemoveAllOverlays}
          className="w-full mt-2 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors hover-scale"
        >
          Remove Wind Layer
        </button>
      )}
    </div>
  );
};

export default MapLayerControls;