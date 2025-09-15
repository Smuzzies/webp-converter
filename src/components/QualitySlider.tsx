import * as Slider from '@radix-ui/react-slider';

interface QualitySliderProps {
  quality: number;
  onChange: (quality: number) => void;
  disabled?: boolean;
}

export function QualitySlider({ quality, onChange, disabled }: QualitySliderProps) {
  const presets = [
    { label: 'Low', value: 60, description: 'Smaller file size' },
    { label: 'Medium', value: 75, description: 'Balanced' },
    { label: 'High', value: 85, description: 'Better quality' },
    { label: 'Best', value: 95, description: 'Highest quality' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">
          Quality: {quality}%
        </label>
        <div className="flex gap-2">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onChange(preset.value)}
              disabled={disabled}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                quality === preset.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={preset.description}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
      
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[quality]}
        onValueChange={([value]) => onChange(value)}
        max={100}
        min={1}
        step={1}
        disabled={disabled}
      >
        <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
          <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-5 h-5 bg-white border-2 border-blue-500 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          aria-label="Quality"
        />
      </Slider.Root>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>Smaller file</span>
        <span>Better quality</span>
      </div>
    </div>
  );
}