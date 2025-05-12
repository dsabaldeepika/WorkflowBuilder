import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Palette, Check, Tag } from 'lucide-react';

// Predefined color themes
export const colorThemes = {
  default: {
    primary: '#f1f5f9', // Slate-100
    border: '#e2e8f0',  // Slate-200
    text: '#475569'     // Slate-600
  },
  light: {
    primary: '#f8fafc', // Slate-50
    border: '#f1f5f9',  // Slate-100
    text: '#64748b'     // Slate-500
  },
  dark: {
    primary: '#334155', // Slate-700
    border: '#475569',  // Slate-600
    text: '#f8fafc'     // Slate-50
  },
  colorful: {
    primary: '#dbeafe', // Blue-100
    border: '#bfdbfe',  // Blue-200
    text: '#3b82f6'     // Blue-500
  },
  minimal: {
    primary: '#ffffff', // White
    border: '#e2e8f0',  // Slate-200
    text: '#0f172a'     // Slate-900
  }
};

// Commonly used colors for categorization
export const presetColors = [
  { name: 'Marketing', color: '#f0abfc', borderColor: '#e879f9', text: '#701a75' }, // Fuchsia
  { name: 'Sales', color: '#bfdbfe', borderColor: '#93c5fd', text: '#1e40af' },     // Blue
  { name: 'Finance', color: '#bbf7d0', borderColor: '#86efac', text: '#166534' },   // Green
  { name: 'HR', color: '#fed7aa', borderColor: '#fdba74', text: '#9a3412' },        // Orange
  { name: 'Support', color: '#c7d2fe', borderColor: '#a5b4fc', text: '#3730a3' },   // Indigo
  { name: 'Development', color: '#ddd6fe', borderColor: '#c4b5fd', text: '#5b21b6' }, // Violet
  { name: 'Product', color: '#fecaca', borderColor: '#fca5a5', text: '#991b1b' },   // Red
  { name: 'Design', color: '#fde68a', borderColor: '#fcd34d', text: '#92400e' },    // Amber
  { name: 'Operations', color: '#a5f3fc', borderColor: '#67e8f9', text: '#155e75' }, // Cyan
  { name: 'Legal', color: '#cbd5e1', borderColor: '#94a3b8', text: '#334155' }      // Slate
];

interface NodeColorPickerProps {
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  theme?: 'default' | 'light' | 'dark' | 'colorful' | 'minimal' | 'custom';
  colorLabel?: string;
  onChange: (colorData: {
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    theme?: 'default' | 'light' | 'dark' | 'colorful' | 'minimal' | 'custom';
    colorLabel?: string;
  }) => void;
}

export function NodeColorPicker({
  color,
  backgroundColor,
  borderColor,
  theme = 'default',
  colorLabel,
  onChange
}: NodeColorPickerProps) {
  const { toast } = useToast();
  const [currentTheme, setCurrentTheme] = useState<string>(theme);
  const [currentColor, setCurrentColor] = useState<string>(color || '');
  const [currentBgColor, setCurrentBgColor] = useState<string>(backgroundColor || colorThemes.default.primary);
  const [currentBorderColor, setCurrentBorderColor] = useState<string>(borderColor || colorThemes.default.border);
  const [currentLabel, setCurrentLabel] = useState<string>(colorLabel || '');
  const [customLabel, setCustomLabel] = useState<string>('');

  // Handle theme change
  const handleThemeChange = (value: string) => {
    setCurrentTheme(value);
    
    if (value !== 'custom') {
      const themeColors = colorThemes[value as keyof typeof colorThemes];
      setCurrentBgColor(themeColors.primary);
      setCurrentBorderColor(themeColors.border);
      setCurrentColor(themeColors.text);
      
      onChange({
        color: themeColors.text,
        backgroundColor: themeColors.primary,
        borderColor: themeColors.border,
        theme: value as any,
        colorLabel: currentLabel
      });
    }
  };

  // Handle preset color selection
  const handlePresetSelect = (preset: typeof presetColors[number]) => {
    setCurrentTheme('custom');
    setCurrentBgColor(preset.color);
    setCurrentBorderColor(preset.borderColor);
    setCurrentColor(preset.text);
    setCurrentLabel(preset.name);
    
    onChange({
      color: preset.text,
      backgroundColor: preset.color,
      borderColor: preset.borderColor,
      theme: 'custom',
      colorLabel: preset.name
    });

    toast({
      title: 'Color Applied',
      description: `Applied "${preset.name}" color scheme to the node.`
    });
  };

  // Handle custom color changes
  const handleCustomColorChange = () => {
    onChange({
      color: currentColor,
      backgroundColor: currentBgColor,
      borderColor: currentBorderColor,
      theme: 'custom',
      colorLabel: customLabel || currentLabel
    });

    if (customLabel) {
      setCurrentLabel(customLabel);
    }

    toast({
      title: 'Custom Color Applied',
      description: 'Applied custom color scheme to the node.'
    });
  };

  // Demo node to preview color changes
  const DemoNode = ({ bg, border, textColor, label }: { bg: string, border: string, textColor: string, label: string }) => (
    <div 
      className="rounded-md p-3 transition-all"
      style={{
        backgroundColor: bg,
        borderColor: border,
        borderWidth: '1px',
        borderStyle: 'solid',
        color: textColor
      }}
    >
      <div className="text-sm font-medium mb-1" style={{ color: textColor }}>
        {label || 'Node Preview'}
      </div>
      <div className="text-xs opacity-80" style={{ color: textColor }}>
        See how your color changes will look
      </div>
    </div>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <div 
            className="w-4 h-4 rounded-full mr-1" 
            style={{ 
              backgroundColor: backgroundColor || colorThemes.default.primary,
              border: `1px solid ${borderColor || colorThemes.default.border}`
            }} 
          />
          <span className="mr-1">
            {colorLabel || (theme !== 'custom' ? theme.charAt(0).toUpperCase() + theme.slice(1) : 'Default')}
          </span>
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">Customize Node Appearance</h4>
          
          <div className="bg-muted/50 rounded-md p-2 mb-3">
            <DemoNode 
              bg={currentBgColor} 
              border={currentBorderColor} 
              textColor={currentColor}
              label={currentLabel} 
            />
          </div>

          <Tabs defaultValue={currentTheme} onValueChange={handleThemeChange}>
            <TabsList className="grid grid-cols-2 mb-2">
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="theme" className="space-y-4">
              <RadioGroup 
                defaultValue={currentTheme}
                onValueChange={handleThemeChange}
              >
                {Object.keys(colorThemes).map((themeName) => (
                  <div key={themeName} className="flex items-center space-x-2">
                    <RadioGroupItem value={themeName} id={`theme-${themeName}`} />
                    <Label htmlFor={`theme-${themeName}`} className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2" 
                        style={{ 
                          backgroundColor: colorThemes[themeName as keyof typeof colorThemes].primary,
                          border: `1px solid ${colorThemes[themeName as keyof typeof colorThemes].border}`
                        }} 
                      />
                      {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="pt-2">
                <h5 className="text-sm font-medium mb-2">Category Presets</h5>
                <div className="grid grid-cols-5 gap-1">
                  {presetColors.map((preset, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="h-8 w-full p-0.5 aspect-square"
                      title={preset.name}
                      onClick={() => handlePresetSelect(preset)}
                    >
                      <div 
                        className="w-full h-full rounded-sm flex items-center justify-center"
                        style={{ 
                          backgroundColor: preset.color,
                          border: `1px solid ${preset.borderColor}`
                        }}
                      >
                        {currentLabel === preset.name && <Check className="h-3 w-3" style={{ color: preset.text }} />}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-3">
              <div className="grid gap-2">
                <Label htmlFor="bg-color">Background Color</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: currentBgColor, borderColor: currentBorderColor }}
                  />
                  <Input 
                    id="bg-color"
                    type="text"
                    value={currentBgColor}
                    onChange={(e) => setCurrentBgColor(e.target.value)}
                    placeholder="#ffffff or rgba(255,255,255,1)"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="border-color">Border Color</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-8 h-8 rounded border-2"
                    style={{ borderColor: currentBorderColor }}
                  />
                  <Input 
                    id="border-color"
                    type="text"
                    value={currentBorderColor}
                    onChange={(e) => setCurrentBorderColor(e.target.value)}
                    placeholder="#dddddd or rgba(221,221,221,1)"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="text-color">Text Color</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-8 h-8 rounded border flex items-center justify-center text-xs font-bold"
                    style={{ color: currentColor, backgroundColor: currentBgColor, borderColor: currentBorderColor }}
                  >
                    Aa
                  </div>
                  <Input 
                    id="text-color"
                    type="text"
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    placeholder="#000000 or rgba(0,0,0,1)"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="color-label" className="flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  Label (optional)
                </Label>
                <Input 
                  id="color-label"
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="Marketing, Sales, Support, etc."
                />
              </div>

              <Button 
                className="w-full mt-2" 
                size="sm"
                onClick={handleCustomColorChange}
              >
                Apply Custom Colors
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
}