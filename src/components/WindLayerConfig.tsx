import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Save, Wind } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WindLayerConfig {
  textColor: string;
  textSize: number;
  textOpacity: number;
  haloColor: string;
  haloWidth: number;
  symbolSpacing: number;
  allowOverlap: boolean;
  barbStyle: string;
  speedUnit: string;
}

const WindLayerConfig: React.FC = () => {
  const { toast } = useToast();
  
  const [windConfig, setWindConfig] = useState<WindLayerConfig>({
    textColor: '#ffffff',
    textSize: 16,
    textOpacity: 0.9,
    haloColor: '#000000',
    haloWidth: 1,
    symbolSpacing: 80,
    allowOverlap: true,
    barbStyle: 'full',
    speedUnit: 'knots'
  });

  const updateConfigValue = (property: keyof WindLayerConfig, value: any) => {
    setWindConfig(prev => ({
      ...prev,
      [property]: value
    }));
  };

  const applyWindConfiguration = () => {
    // Emit custom event for WindMap to listen to
    const configEvent = new CustomEvent('windConfigUpdate', {
      detail: { config: windConfig }
    });
    window.dispatchEvent(configEvent);

    toast({
      title: "Wind Configuration Applied",
      description: "Wind layer styling updated successfully"
    });
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-2 mb-4">
        <Wind className="h-5 w-5 text-primary" />
        <Label className="text-lg font-semibold">Wind Layer Configuration</Label>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Wind Barb Color</Label>
          <Input
            type="color"
            value={windConfig.textColor}
            onChange={(e) => updateConfigValue('textColor', e.target.value)}
            className="w-full h-8"
          />
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Wind Barb Size</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[windConfig.textSize]}
              onValueChange={([value]) => updateConfigValue('textSize', value)}
              min={8}
              max={32}
              step={1}
              className="flex-1"
            />
            <span className="text-xs w-8">{windConfig.textSize}px</span>
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Wind Barb Opacity</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[windConfig.textOpacity]}
              onValueChange={([value]) => updateConfigValue('textOpacity', value)}
              min={0}
              max={1}
              step={0.1}
              className="flex-1"
            />
            <span className="text-xs w-12">{windConfig.textOpacity}</span>
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Halo Color</Label>
          <Input
            type="color"
            value={windConfig.haloColor}
            onChange={(e) => updateConfigValue('haloColor', e.target.value)}
            className="w-full h-8"
          />
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Halo Width</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[windConfig.haloWidth]}
              onValueChange={([value]) => updateConfigValue('haloWidth', value)}
              min={0}
              max={5}
              step={0.5}
              className="flex-1"
            />
            <span className="text-xs w-8">{windConfig.haloWidth}px</span>
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Barb Spacing</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[windConfig.symbolSpacing]}
              onValueChange={([value]) => updateConfigValue('symbolSpacing', value)}
              min={20}
              max={200}
              step={10}
              className="flex-1"
            />
            <span className="text-xs w-12">{windConfig.symbolSpacing}px</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={windConfig.allowOverlap}
            onCheckedChange={(checked) => updateConfigValue('allowOverlap', checked)}
          />
          <Label className="text-xs">Allow Symbol Overlap</Label>
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Speed Unit</Label>
          <Select 
            value={windConfig.speedUnit} 
            onValueChange={(value) => updateConfigValue('speedUnit', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="knots">Knots</SelectItem>
              <SelectItem value="ms">m/s</SelectItem>
              <SelectItem value="kmh">km/h</SelectItem>
              <SelectItem value="mph">mph</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Barb Style</Label>
          <Select 
            value={windConfig.barbStyle} 
            onValueChange={(value) => updateConfigValue('barbStyle', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Wind Barbs</SelectItem>
              <SelectItem value="simplified">Simplified Arrows</SelectItem>
              <SelectItem value="dots">Speed Dots</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={applyWindConfiguration}
          className="w-full"
          size="sm"
        >
          <Save className="h-4 w-4 mr-2" />
          Apply Wind Configuration
        </Button>
      </div>
    </div>
  );
};

export default WindLayerConfig;