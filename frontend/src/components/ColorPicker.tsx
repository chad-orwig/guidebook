import { TailwindHueEnum, TailwindShadeEnum, type TailwindColor } from '@guidebook/models';
import { getColorClasses } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ColorPickerProps {
  value?: TailwindColor;
  onChange: (color: TailwindColor | undefined) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const hues = TailwindHueEnum.options;
  const shades = TailwindShadeEnum.options;

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      {value && (
        <div className="flex items-center gap-2">
          <div className={cn('w-8 h-8 rounded', getColorClasses(value))} />
          <span className="text-sm">
            {value.hue}-{value.shade}
          </span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onChange(undefined)}
          >
            Clear
          </Button>
        </div>
      )}

      <div className="inline-grid grid-rows-8 gap-0 border border-border rounded">
        {shades.map((shade) => (
          <div
            key={shade}
            className="grid gap-0"
            style={{ gridTemplateColumns: 'var(--grid-template-columns-18)' }}
          >
            {hues.map((hue) => {
              const isSelected = value?.hue === hue && value?.shade === shade;

              return (
                <button
                  key={`${hue}-${shade}`}
                  type="button"
                  className={cn(
                    'w-8 h-8 cursor-pointer transition-all',
                    getColorClasses({ hue, shade }),
                    'hover:ring-2 hover:ring-gray-400 hover:ring-inset',
                    isSelected && 'ring-4 ring-black ring-inset'
                  )}
                  onClick={() => onChange({ hue, shade })}
                  title={`${hue}-${shade}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
