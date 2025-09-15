import * as RadioGroup from '@radix-ui/react-radio-group';
import { NamingOptions as NamingOptionsType } from '../types';

interface NamingOptionsProps {
  options: NamingOptionsType;
  onChange: (options: NamingOptionsType) => void;
  disabled?: boolean;
}

export function NamingOptions({ options, onChange, disabled }: NamingOptionsProps) {
  const schemes = [
    {
      value: 'keep-original',
      label: 'Keep original name',
      example: 'image.png → image.webp',
    },
    {
      value: 'add-suffix',
      label: 'Add suffix',
      example: 'image.png → image_compressed.webp',
    },
    {
      value: 'custom',
      label: 'Custom pattern',
      example: 'image.png → img_001_webp.webp',
    },
  ];

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-gray-700">
        File Naming
      </label>
      
      <RadioGroup.Root
        value={options.scheme}
        onValueChange={(value: string) => onChange({ ...options, scheme: value as NamingOptionsType['scheme'] })}
        disabled={disabled}
        className="space-y-2"
      >
        {schemes.map((scheme) => (
          <div key={scheme.value} className="flex items-start space-x-3">
            <RadioGroup.Item
              value={scheme.value}
              className="w-4 h-4 mt-0.5 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-blue-500" />
            </RadioGroup.Item>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-900">
                {scheme.label}
              </label>
              <p className="text-xs text-gray-500">{scheme.example}</p>
            </div>
          </div>
        ))}
      </RadioGroup.Root>
      
      {options.scheme === 'add-suffix' && (
        <input
          type="text"
          value={options.suffix || '_compressed'}
          onChange={(e) => onChange({ ...options, suffix: e.target.value })}
          disabled={disabled}
          placeholder="Enter suffix"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
      )}
      
      {options.scheme === 'custom' && (
        <div className="space-y-2">
          <input
            type="text"
            value={options.customPattern || '{name}_{index}'}
            onChange={(e) => onChange({ ...options, customPattern: e.target.value })}
            disabled={disabled}
            placeholder="Enter pattern"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <p className="text-xs text-gray-500">
            Available variables: {'{name}'}, {'{index}'}, {'{date}'}
          </p>
        </div>
      )}
    </div>
  );
}